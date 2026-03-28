"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, useSession, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

// <-- IMPORTAÇÃO DO SERVIÇO AQUI -->
import { redacaoService } from "@/services/redacaoService";

import { SheetHeader } from "@/components/home/sheet-header";
import { StructureSidebar } from "@/components/home/structure-sidebar";
import { WritingArea } from "@/components/home/writing-area";
import { SheetFooter } from "@/components/home/sheet-footer";
import {
  TOTAL_LINES,
  StructureType,
  LineStructure,
} from "@/components/home/constants";

export function EnemSheet() {
  const router = useRouter();
  const searchParams = useSearchParams(); // <-- CAPTURA A URL
  const editId = searchParams.get("editId"); // <-- EXTRAI O ID, se existir
  // --- ESTADOS PRINCIPAIS ---
  const [tema, setTema] = useState("");
  const [linhas, setLinhas] = useState<string[]>(Array(TOTAL_LINES).fill(""));
  const [alertasPorLinha, setAlertasPorLinha] = useState<Record<number, any[]>>(
    {},
  );
  const [darkMode, setDarkMode] = useState(false);
  const [isCarregandoEdicao, setIsCarregandoEdicao] = useState(false); // Novo estado
  const [lineStructures, setLineStructures] = useState<LineStructure>({});
  const [selectedStructure, setSelectedStructure] =
    useState<StructureType>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { session } = useSession();

  // --- ESTATÍSTICAS ---
  const occupiedLines = linhas.filter((line) => line.trim().length > 0).length;
  const wordCount = linhas
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter((w) => w !== "").length;
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
        const response = await fetch(
          "https://api.languagetoolplus.com/v2/check",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              text: textoCompleto,
              language: "pt-BR",
              level: "picky",
            }),
          },
        );

        if (!response.ok) {
          const erroTexto = await response.text();
          console.warn("Aviso do LanguageTool:", erroTexto);
          return; // Para a execução silenciosamente sem quebrar a tela
        }

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
                textoErro: linha.substring(
                  match.offset - inicioLinha,
                  match.offset - inicioLinha + match.length,
                ),
              });
            }
          });
          charAcumulado += linha.length + 1;
        });
        setAlertasPorLinha(novosAlertas);
      } catch (err) {
        console.error(err);
      }
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

  const aplicarSugestao = (
    linhaIdx: number,
    erro: string,
    sugestao: string,
  ) => {
    const novasLinhas = [...linhas];
    novasLinhas[linhaIdx] = novasLinhas[linhaIdx].replace(erro, sugestao);
    setLinhas(novasLinhas);

    const novosAlertas = { ...alertasPorLinha };
    delete novosAlertas[linhaIdx];
    setAlertasPorLinha(novosAlertas);
  };

  // --- FUNÇÕES DE PAINEL ---
  const handleSaveDraft = async () => {
    if (!isSignedIn || !session) {
      alert("Você precisa fazer login para salvar rascunhos!");
      return;
    }

    if (!tema.trim()) {
      alert(
        "Por favor, digite o tema da redação no cabeçalho antes de salvar.",
      );
      return;
    }

    try {
      const token = await session.getToken();

      const payload = {
        tema: tema.trim(),
        linhasFront: linhas,
        totalLinhas: occupiedLines,
        totalPalavras: wordCount,
        totalCaracteres: charCount,
        structure_map: lineStructures,
      };

      // VERIFICA SE TEM ID NA URL
      if (editId) {
        // Se tem ID, estamos editando -> Fazemos um PUT
        await redacaoService.atualizar(token as string, editId, payload);
        alert("✏️ Edição salva com sucesso!");
      } else {
        // Se não tem ID, é redação nova -> Fazemos um POST
        await redacaoService.salvar(token as string, payload);
        alert("🎉 Nova redação salva com sucesso!");
        // Opcional: Redirecionar para o dashboard após salvar, ou limpar a folha
        // router.push("/dashboard");
      }
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
    router.push("/dashboard");
  };

  const clearSheet = () => {
    setLinhas(Array(TOTAL_LINES).fill(""));
    setTema(""); // Garante que o tema também é limpo
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

  // EFEITO: CARREGAR REDAÇÃO PARA EDIÇÃO
  useEffect(() => {
    async function carregarRedacao() {
      if (editId && session) {
        setIsCarregandoEdicao(true);
        try {
          const token = await session.getToken();
          const pauta = await redacaoService.buscarPorId(
            token as string,
            editId,
          );

          // 1. Seta o tema
          setTema(pauta.tema || "");

          // 2. Transforma a string do banco ("linha1\nlinha2") de volta num array de 30 posições
          const novasLinhas = Array(TOTAL_LINES).fill("");
          if (pauta.corpo) {
            const linhasDoBanco = pauta.corpo.split("\n");
            linhasDoBanco.forEach((l: string, i: number) => {
              if (i < TOTAL_LINES) novasLinhas[i] = l;
            });
          }
          setLinhas(novasLinhas);

          // 3. Puxa as cores de introdução/desenvolvimento
          if (pauta.structure_map) {
            setLineStructures(pauta.structure_map);
          }
        } catch (error) {
          console.error("Erro ao carregar redação para edição:", error);
          alert("Não foi possível carregar o rascunho.");
        } finally {
          setIsCarregandoEdicao(false);
        }
      }
    }

    carregarRedacao();
  }, [editId, session]);

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
              isCarregandoEdicao={isCarregandoEdicao}
            />

            <div className="flex-1 flex flex-col gap-4">
              <WritingArea
                tema={tema}
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
