"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, useSession, SignInButton, UserButton } from "@clerk/nextjs";
import { SheetHeader } from "@/components/simulador/sheet-header";
import { StructureSidebar } from "@/components/simulador/structure-sidebar";
import { WritingArea } from "@/components/simulador/writing-area";
import { SheetFooter } from "@/components/simulador/sheet-footer";
import { TOTAL_LINES, StructureType, LineStructure } from "@/components/simulador/constants";

export function EnemSheet() {
  // --- ESTADOS PRINCIPAIS ---
  const [tema, setTema] = useState(""); // <-- ADICIONE O ESTADO DO TEMA AQUI
  const [linhas, setLinhas] = useState<string[]>(Array(TOTAL_LINES).fill(""));
  const [alertasPorLinha, setAlertasPorLinha] = useState<Record<number, any[]>>({});
  const [darkMode, setDarkMode] = useState(false);
  const [lineStructures, setLineStructures] = useState<LineStructure>({});
  const [selectedStructure, setSelectedStructure] = useState<StructureType>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { session } = useSession(); // <-- Adicione esta linha
  // --- ESTATÍSTICAS ---
  const occupiedLines = linhas.filter((line) => line.trim().length > 0).length;
  const wordCount = linhas.join(" ").trim().split(/\s+/).filter(w => w !== "").length;
  const charCount = linhas.join("").length;

  // --- INTEGRAÇÃO LANGUAGETOOL ---
  useEffect(() => {
    const textoCompleto = linhas.join("\n");
    if (textoCompleto.trim().length < 5) {
      setAlertasPorLinha({});
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch("https://api.languagetoolplus.com/v2/check", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ text: textoCompleto, language: "pt-BR", level: "picky" }),
        });
        const data = await response.json();
        
        const novosAlertas: Record<number, any[]> = {};
        let charAcumulado = 0;

        linhas.forEach((linha, idx) => {
          const inicioLinha = charAcumulado;
          const fimLinha = charAcumulado + linha.length;

          data.matches.forEach((match: any) => {
            if (match.offset >= inicioLinha && match.offset < fimLinha) {
              if (!novosAlertas[idx]) novosAlertas[idx] = [];
              novosAlertas[idx].push({
                ...match,
                textoErro: linha.substring(match.offset - inicioLinha, (match.offset - inicioLinha) + match.length)
              });
            }
          });
          charAcumulado += linha.length + 1;
        });
        setAlertasPorLinha(novosAlertas);
      } catch (err) { console.error(err); }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [linhas]);


  const toggleLineStructure = (lineIndex: number) => {
    if (selectedStructure) {
      setLineStructures((prev) => ({
        ...prev,
        [lineIndex]:
          prev[lineIndex] === selectedStructure ? null : selectedStructure,
      }));
    }
  };

  const aplicarSugestao = (linhaIdx: number, erro: string, sugestao: string) => {
    const novasLinhas = [...linhas];
    novasLinhas[linhaIdx] = novasLinhas[linhaIdx].replace(erro, sugestao);
    setLinhas(novasLinhas);

    const novosAlertas = { ...alertasPorLinha };
    delete novosAlertas[linhaIdx];
    setAlertasPorLinha(novosAlertas);
  };

  // --- FUNÇÕES DE PAINEL ---
  // --- FUNÇÕES DE PAINEL ---
  const handleSaveDraft = async () => {
    if (!isSignedIn || !session) {
      alert("Você precisa fazer login para salvar rascunhos!");
      return;
    }

    if (!tema.trim()) {
      alert("Por favor, digite o tema da redação no cabeçalho antes de salvar.");
      return;
    }

    try {
      // 1. Pega um token JWT novinho direto do Clerk (dura 60s)
      const token = await session.getToken();

      // 2. Prepara o objeto (payload) igualzinho o Swagger pede
      const payload = {
        tema: tema.trim(), // O tema que o usuário digitou
        linhasFront: linhas,
        totalLinhas: occupiedLines,
        totalPalavras: wordCount,
        totalCaracteres: charCount,
        structure_map: lineStructures, // Manda as marcações de introdução/conclusão
      };

      // 3. Faz o POST para o seu backend Express
      const response = await fetch("http://localhost:4000/redacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // <- O crachá de segurança indo aqui!
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar redação");
      }

      alert("🎉 Redação salva com sucesso no banco Neon!");
      console.log("Resposta do Backend:", data);

    } catch (error: any) {
      console.error("Erro no salvamento:", error);
      alert(`Falha ao salvar: ${error.message}`);
    }
  };

  const handleViewEssays = () => {
    if (!isSignedIn) {
      alert("Você precisa fazer login para ver suas redações!");
      return;
    }
    // Aqui no futuro você pode abrir um Modal com a lista, ou redirecionar de página
    alert("Pronto para integrar! Carregando lista de redações...");
  };

  const clearSheet = () => {
    setLinhas(Array(TOTAL_LINES).fill(""));
    setLineStructures({});
    setAlertasPorLinha({});
  };

  const exportToPDF = useCallback(async () => {
    if (!sheetRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    const canvas = await html2canvas(sheetRef.current, {
      scale: 2,
      backgroundColor: darkMode ? "#1a1a1a" : "#faf8f5",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("redacao-enem.pdf");
  }, [darkMode]);

  const handleAICorrection = () => {
    if (occupiedLines === 0) {
      alert("Escreva sua redação antes de solicitar a correção com IA.");
      return;
    }
    alert(
      "O Array 'linhas' agora está perfeitamente pronto para ser enviado ao backend via POST!",
    );
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen transition-colors duration-500 ${
          darkMode ? "bg-zinc-900" : "bg-stone-200"
        }`}
      >
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <SheetHeader
            darkMode={darkMode}
            onDarkModeChange={setDarkMode}
            onClearClick={clearSheet}
            onExportPDF={exportToPDF}
            occupiedLines={occupiedLines}
            onAICorrection={handleAICorrection}
          />

          <div className="flex gap-6 flex-col lg:flex-row">
            <StructureSidebar
              selectedStructure={selectedStructure}
              onStructureSelect={setSelectedStructure}
              darkMode={darkMode}
              isSignedIn={isSignedIn}
              onSaveDraft={handleSaveDraft}
              onViewEssays={handleViewEssays}
            />

            <div className="flex-1 flex flex-col gap-4">
              <WritingArea
                tema={tema}             // <-- Manda a string
                onTemaChange={setTema}
                linhas={linhas}
                onLinhasChange={setLinhas}
                lineStructures={lineStructures}
                onToggleLineStructure={toggleLineStructure}
                selectedStructure={selectedStructure}
                alertasPorLinha={alertasPorLinha}
                onAplicarSugestao={aplicarSugestao}
                darkMode={darkMode}
                sheetRef={sheetRef}
                inputsRef={inputsRef}
              />

              <SheetFooter
                occupiedLines={occupiedLines}
                wordCount={wordCount}
                charCount={charCount}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}