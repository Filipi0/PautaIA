"use client";

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Download,
  Moon,
  Sun,
  FileText,
  Type,
  AlignLeft,
  Hash,
  Sparkles,
  Info,
  AlertCircle // Novo ícone para os erros
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// IMPORTANTE: Adicione as importações do Popover que instalamos
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TOTAL_LINES = 30;
const CHARS_PER_LINE = 80;

type StructureType = "intro" | "dev1" | "dev2" | "conclusion" | null;

interface LineStructure {
  [key: number]: StructureType;
}

const structureColors: Record<
  string,
  { bg: string; border: string; label: string }
> = {
  intro: {
    bg: "bg-blue-200/20",
    border: "border-l-blue-500",
    label: "Introdução",
  },
  dev1: {
    bg: "bg-green-200/20",
    border: "border-l-green-500",
    label: "Desenvolvimento 1",
  },
  dev2: {
    bg: "bg-amber-200/20",
    border: "border-l-amber-500",
    label: "Desenvolvimento 2",
  },
  conclusion: {
    bg: "bg-purple-200/20",
    border: "border-l-purple-500",
    label: "Conclusão",
  },
};

export function EnemSheet() {
  const { isSignedIn } = useAuth(); // <- ADICIONE ESTA LINHA AQUI

  // --- NOVOS ESTADOS DA ARQUITETURA DE ARRAY ---
  const [linhas, setLinhas] = useState<string[]>(Array(TOTAL_LINES).fill(""));
  const [alertasPorLinha, setAlertasPorLinha] = useState<Record<number, any[]>>({});
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // --- ESTADOS ORIGINAIS MANTIDOS ---
  const [darkMode, setDarkMode] = useState(false);
  const [lineStructures, setLineStructures] = useState<LineStructure>({});
  const [selectedStructure, setSelectedStructure] = useState<StructureType>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // --- ESTATÍSTICAS ATUALIZADAS PARA LER O ARRAY ---
  const occupiedLines = linhas.filter((line) => line.trim().length > 0).length;
  const wordCount = linhas.join(" ").trim().split(/\s+/).filter(w => w !== "").length;
  const charCount = linhas.join("").length;

  // --- NOVA LÓGICA DE DIGITAÇÃO INDIVIDUAL ---
  const handleInputChange = (index: number, value: string) => {
    const novasLinhas = [...linhas];
    
    if (value.length > CHARS_PER_LINE) {
      // Quebra automática: linha atual fica com 79 chars, resto vai pra próxima
      const textoAtual = value.substring(0, CHARS_PER_LINE);
      const textoExcedente = value.substring(CHARS_PER_LINE);
      
      novasLinhas[index] = textoAtual;
      
      // Move o texto excedente para a próxima linha se houver espaço
      if (index < TOTAL_LINES - 1) {
        novasLinhas[index + 1] = textoExcedente + novasLinhas[index + 1];
        setLinhas(novasLinhas);
        // Coloca o foco na próxima linha
        setTimeout(() => inputsRef.current[index + 1]?.focus(), 0);
      } else {
        novasLinhas[index] = textoAtual;
        setLinhas(novasLinhas);
      }
    } else {
      novasLinhas[index] = value;
      setLinhas(novasLinhas);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Tab") {
      e.preventDefault();
      // Inserir 4 espaços para indentação de parágrafo
      const input = e.currentTarget;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const novasLinhas = [...linhas];
      const novaLinha = 
        novasLinhas[index].substring(0, start) + 
        "    " + 
        novasLinhas[index].substring(end);
      
      if (novaLinha.length <= CHARS_PER_LINE) {
        novasLinhas[index] = novaLinha;
        setLinhas(novasLinhas);
        // Posiciona o cursor após os espaços inseridos
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = start + 4;
        }, 0);
      }
      return;
    }
    
    if (e.key === "Enter") {
      e.preventDefault();
      if (index < TOTAL_LINES - 1) inputsRef.current[index + 1]?.focus();
    }
    if (e.key === "Backspace" && linhas[index] === "" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowDown" && index < TOTAL_LINES - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

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

  const aplicarSugestao = (linhaIdx: number, erro: string, sugestao: string) => {
    const novasLinhas = [...linhas];
    novasLinhas[linhaIdx] = novasLinhas[linhaIdx].replace(erro, sugestao);
    setLinhas(novasLinhas);
    
    const novosAlertas = { ...alertasPorLinha };
    delete novosAlertas[linhaIdx];
    setAlertasPorLinha(novosAlertas);
  };

  // --- FUNÇÕES ORIGINAIS ---
  const clearSheet = () => {
    setLinhas(Array(TOTAL_LINES).fill(""));
    setLineStructures({});
    setAlertasPorLinha({});
  };

  const toggleLineStructure = (lineIndex: number) => {
    if (selectedStructure) {
      setLineStructures((prev) => ({
        ...prev,
        [lineIndex]:
          prev[lineIndex] === selectedStructure ? null : selectedStructure,
      }));
    }
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
          {/* Header INTACTO */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <FileText
                  className={`w-8 h-8 ${darkMode ? "text-white" : "text-stone-800"}`}
                />
                <h1
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-stone-800"
                  }`}
                >
                  Simulador de Redação
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sun
                    className={`w-4 h-4 ${
                      darkMode ? "text-zinc-400" : "text-amber-500"
                    }`}
                  />
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    aria-label="Alternar modo escuro"
                  />
                  <Moon
                    className={`w-4 h-4 ${
                      darkMode ? "text-blue-400" : "text-zinc-400"
                    }`}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={clearSheet}
                  className={
                    darkMode
                      ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                      : ""
                  }
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>

                <Button
                  onClick={exportToPDF}
                  className={darkMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>

                {/* SE O USUÁRIO NÃO ESTIVER LOGADO */}
                {!isSignedIn && (
                  <SignInButton>
                    <Button className="bg-stone-800 text-white hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200">
                      Fazer Login
                    </Button>
                  </SignInButton>
                )}

                {/* SE O USUÁRIO ESTIVER LOGADO */}
                {isSignedIn && (
                  <>
                    <Button
                      onClick={handleAICorrection}
                      className={`${
                        darkMode
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                          : "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                      } text-white`}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Correção com IA
                    </Button>

                    <div className="ml-2 border-l border-stone-300 dark:border-zinc-700 pl-4">
                      <UserButton />
                    </div>
                  </>
                )}

                <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full ${
                        darkMode
                          ? "text-zinc-400 hover:text-white hover:bg-zinc-700"
                          : "text-stone-500 hover:text-stone-800 hover:bg-stone-200"
                      }`}
                      aria-label="Informações sobre o site"
                    >
                      <Info className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className={
                      darkMode ? "bg-zinc-900 border-zinc-700 text-white" : ""
                    }
                  >
                    <DialogHeader>
                      <DialogTitle
                        className={`flex items-center gap-2 ${
                          darkMode ? "text-white" : ""
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                        Sobre o Simulador de Redação
                      </DialogTitle>
                      <DialogDescription
                        className={darkMode ? "text-zinc-400" : ""}
                      >
                        Pratique sua redação no formato oficial do ENEM
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                      <div>
                        <h3
                          className={`text-sm font-semibold mb-2 ${
                            darkMode ? "text-zinc-200" : "text-stone-800"
                          }`}
                        >
                          Funcionalidades
                        </h3>
                        <ul
                          className={`text-sm space-y-1.5 ${
                            darkMode ? "text-zinc-400" : "text-stone-600"
                          }`}
                        >
                          <li>
                            - Folha de redação com 30 linhas no formato oficial
                          </li>
                          <li>
                            - Contagem de linhas, palavras e caracteres em tempo
                            real
                          </li>
                          <li>
                            - Marcadores de estrutura (Introdução,
                            Desenvolvimento, Conclusão)
                          </li>
                          <li>- Exportação para PDF</li>
                          <li>- Modo claro e escuro</li>
                          <li>
                            - Correção com Inteligência Artificial (em breve)
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3
                          className={`text-sm font-semibold mb-2 ${
                            darkMode ? "text-zinc-200" : "text-stone-800"
                          }`}
                        >
                          Dicas para uma boa redação
                        </h3>
                        <ul
                          className={`text-sm space-y-1.5 ${
                            darkMode ? "text-zinc-400" : "text-stone-600"
                          }`}
                        >
                          <li>
                            - Escreva no mínimo 7 linhas (ideal: 20-30 linhas)
                          </li>
                          <li>
                            - Siga a estrutura: Introdução, Desenvolvimento e
                            Conclusão
                          </li>
                          <li>- Apresente uma proposta de intervenção clara</li>
                          <li>- Respeite os direitos humanos</li>
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.header>

          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Structure Selector INTACTO */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`lg:w-56 rounded-lg p-4 ${
                darkMode ? "bg-zinc-800" : "bg-white shadow-md"
              }`}
            >
              <h2
                className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                  darkMode ? "text-zinc-300" : "text-stone-700"
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                Marcar Estrutura
              </h2>
              <p
                className={`text-xs mb-4 ${
                  darkMode ? "text-zinc-400" : "text-stone-500"
                }`}
              >
                Selecione uma estrutura e clique nas linhas para marcar.
              </p>

              <div className="space-y-2">
                {(["intro", "dev1", "dev2", "conclusion"] as StructureType[]).map(
                  (type) =>
                    type && (
                      <button
                        key={type}
                        onClick={() =>
                          setSelectedStructure(
                            selectedStructure === type ? null : type,
                          )
                        }
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all border-l-4 ${
                          structureColors[type].border
                        } ${
                          selectedStructure === type
                            ? structureColors[type].bg
                            : darkMode
                              ? "bg-zinc-700 hover:bg-zinc-600"
                              : "bg-stone-100 hover:bg-stone-200"
                        } ${darkMode ? "text-zinc-200" : "text-stone-700"}`}
                      >
                        {structureColors[type].label}
                      </button>
                    ),
                )}
              </div>

              {selectedStructure && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs mt-4 p-2 rounded ${
                    darkMode
                      ? "bg-zinc-700 text-zinc-300"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  Clique nos números das linhas para marcar como{" "}
                  <span className="font-semibold">
                    {structureColors[selectedStructure].label}
                  </span>
                </motion.p>
              )}
            </motion.aside>

            {/* Main Sheet */}
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1"
            >
              <div
                ref={sheetRef}
                className={`relative rounded-lg shadow-2xl overflow-hidden ${
                  darkMode ? "bg-zinc-800" : "bg-white"
                }`}
              >
                {/* Sheet Header */}
                <div
                  className={`px-6 py-4 border-b ${
                    darkMode
                      ? "border-zinc-700 bg-zinc-750"
                      : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-zinc-400" : "text-stone-500"
                      }`}
                    >
                      Folha de Redação
                    </span>
                    <span
                      className={`text-xs ${
                        darkMode ? "text-zinc-400" : "text-stone-500"
                      }`}
                    >
                      ENEM - Exame Nacional do Ensino Médio
                    </span>
                  </div>
                </div>

                {/* AREA DE ESCRITA COM CONTAINER QUERY (A MÁGICA AQUI) */}
                <div 
                  className="relative px-4 py-6" 
                  style={{ containerType: "inline-size" }}
                >
                  <div className="relative z-10">
                    {linhas.map((linha, index) => {
                      const lineNum = index + 1;
                      const structure = lineStructures[lineNum - 1];
                      const hasText = linha.trim().length > 0;
                      const hasError = alertasPorLinha[index] && alertasPorLinha[index].length > 0;

                      return (
                        <div
                          key={lineNum}
                          className={`flex items-center h-[28px] border-b transition-colors relative ${
                            darkMode
                              ? "border-zinc-700/50"
                              : "border-stone-300/60"
                          } ${
                            structure
                              ? `${structureColors[structure].bg} ${structureColors[structure].border} border-l-4`
                              : ""
                          }`}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleLineStructure(lineNum - 1)}
                                className={`relative z-10 w-8 flex-shrink-0 text-right pr-3 font-mono text-xs transition-colors cursor-pointer hover:opacity-70 ${
                                  hasText
                                    ? darkMode
                                      ? "text-blue-400"
                                      : "text-blue-600"
                                    : darkMode
                                      ? "text-zinc-500"
                                      : "text-stone-400"
                                } ${selectedStructure ? "ring-2 ring-inset ring-transparent hover:ring-current rounded" : ""}`}
                              >
                                {String(lineNum).padStart(2, "0")}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Selecione uma estrutura</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* INPUT FLUIDO */}
                          <input
                            ref={(el) => { inputsRef.current[index] = el; }}
                            value={linha}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            spellCheck={false}
                            onScroll={(e) => (e.currentTarget.scrollLeft = 0)}
                            className={`flex-1 w-full bg-transparent outline-none font-mono pl-2 pr-8 overflow-hidden ${
                              darkMode ? "text-zinc-200 caret-blue-400" : "text-stone-800 caret-blue-600"
                            } ${hasError ? "underline decoration-red-400 decoration-wavy underline-offset-4" : ""}`}
                            style={{
                              fontSize: "clamp(10px, calc((100cqi - 72px) / 47.4), 16px)",
                            }}
                          />

                          {/* POPOVER DO LANGUAGETOOL */}
                          {hasError && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className={`absolute right-0 hover:scale-110 transition-transform cursor-help px-1 rounded ${darkMode ? "text-amber-400 bg-zinc-800/80" : "text-amber-600 bg-white/80"}`}>
                                  <AlertCircle size={14} />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className={`w-72 p-3 shadow-xl z-50 ${darkMode ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-white"}`}>
                                <div className="text-xs space-y-3">
                                  <p className="font-bold border-b pb-1 dark:border-zinc-700">Sugestões de Correção</p>
                                  {alertasPorLinha[index].map((alerta, aIdx) => (
                                    <div key={aIdx} className={`p-2 rounded border ${darkMode ? "bg-zinc-900/50 border-zinc-700" : "bg-stone-50"}`}>
                                      <p className={`italic mb-1 ${darkMode ? "text-zinc-400" : "text-stone-500"}`}>"{alerta.textoErro}"</p>
                                      <p className="mb-2">{alerta.message}</p>
                                      <div className="flex flex-wrap gap-1">
                                        {alerta.replacements.slice(0, 3).map((rep: any, rIdx: number) => (
                                          <Button 
                                            key={rIdx} 
                                            size="sm" 
                                            variant="secondary" 
                                            className={`h-6 text-[10px] ${darkMode ? "bg-zinc-700 hover:bg-zinc-600" : ""}`}
                                            onClick={() => aplicarSugestao(index, alerta.textoErro, rep.value)}
                                          >
                                            Mudar para "{rep.value}"
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Margin indicators */}
                  <div
                    className={`absolute left-12 top-0 bottom-0 w-px z-0 ${
                      darkMode ? "bg-red-500/20" : "bg-red-400/30"
                    }`}
                  />
                </div>

                {/* Sheet Footer INTACTO */}
                <div
                  className={`px-6 py-3 border-t ${
                    darkMode
                      ? "border-zinc-700 bg-zinc-750"
                      : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={occupiedLines}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className={`flex items-center gap-1.5 text-xs ${
                            darkMode ? "text-zinc-400" : "text-stone-600"
                          }`}
                        >
                          <Hash className="w-3.5 h-3.5" />
                          <span>
                            Linhas:{" "}
                            <span
                              className={`font-semibold ${
                                occupiedLines >= 7
                                  ? darkMode
                                    ? "text-green-400"
                                    : "text-green-600"
                                  : darkMode
                                    ? "text-amber-400"
                                    : "text-amber-600"
                              }`}
                            >
                              {occupiedLines}
                            </span>
                            /{TOTAL_LINES}
                          </span>
                        </motion.div>
                      </AnimatePresence>

                      <div
                        className={`flex items-center gap-1.5 text-xs ${
                          darkMode ? "text-zinc-400" : "text-stone-600"
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>
                          Palavras:{" "}
                          <span className="font-semibold">{wordCount}</span>
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 text-xs ${
                          darkMode ? "text-zinc-400" : "text-stone-600"
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                        <span>
                          Caracteres:{" "}
                          <span className="font-semibold">{charCount}</span>
                        </span>
                      </div>
                    </div>

                    {occupiedLines < 7 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-xs ${
                          darkMode ? "text-amber-400" : "text-amber-600"
                        }`}
                      >
                        Mínimo de 7 linhas recomendado
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>

              {/* Structure Legend INTACTO */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`mt-4 p-4 rounded-lg ${
                  darkMode ? "bg-zinc-800" : "bg-white shadow-md"
                }`}
              >
                <h3
                  className={`text-xs font-semibold mb-2 ${
                    darkMode ? "text-zinc-400" : "text-stone-600"
                  }`}
                >
                  Legenda de Estrutura
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(structureColors).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-sm ${value.bg} ${value.border} border-l-2`}
                      />
                      <span
                        className={`text-xs ${
                          darkMode ? "text-zinc-400" : "text-stone-600"
                        }`}
                      >
                        {value.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}