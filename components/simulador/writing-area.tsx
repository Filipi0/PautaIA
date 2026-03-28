"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useRef, Ref } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TOTAL_LINES, CHARS_PER_LINE, StructureType, LineStructure, structureColors } from "./constants";

interface WritingAreaProps {
  linhas: string[];
  onLinhasChange: (linhas: string[]) => void;
  lineStructures: LineStructure;
  onToggleLineStructure: (lineIndex: number) => void;
  selectedStructure: StructureType;
  alertasPorLinha: Record<number, any[]>;
  onAplicarSugestao: (linhaIdx: number, erro: string, sugestao: string) => void;
  darkMode: boolean;
  sheetRef: Ref<HTMLDivElement>;
  inputsRef: Ref<(HTMLInputElement | null)[]>;
}

export function WritingArea({
  linhas,
  onLinhasChange,
  lineStructures,
  onToggleLineStructure,
  selectedStructure,
  alertasPorLinha,
  onAplicarSugestao,
  darkMode,
  sheetRef,
  inputsRef,
}: WritingAreaProps) {
  const handleInputChange = (index: number, value: string) => {
    const novasLinhas = [...linhas];

    if (value.length > CHARS_PER_LINE) {
      const textoAtual = value.substring(0, CHARS_PER_LINE);
      const textoExcedente = value.substring(CHARS_PER_LINE);

      novasLinhas[index] = textoAtual;

      if (index < TOTAL_LINES - 1) {
        novasLinhas[index + 1] = textoExcedente + novasLinhas[index + 1];
        onLinhasChange(novasLinhas);
        setTimeout(() => {
          const currentRef = inputsRef as any;
          currentRef.current?.[index + 1]?.focus();
        }, 0);
      } else {
        novasLinhas[index] = textoAtual;
        onLinhasChange(novasLinhas);
      }
    } else {
      novasLinhas[index] = value;
      onLinhasChange(novasLinhas);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const currentRef = inputsRef as any;

    if (e.key === "Tab") {
      e.preventDefault();
      const input = e.currentTarget;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const novasLinhas = [...linhas];
      const novaLinha =
        novasLinhas[index].substring(0, start) + "    " + novasLinhas[index].substring(end);

      if (novaLinha.length <= CHARS_PER_LINE) {
        novasLinhas[index] = novaLinha;
        onLinhasChange(novasLinhas);
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = start + 4;
        }, 0);
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (index < TOTAL_LINES - 1) currentRef.current?.[index + 1]?.focus();
    }
    if (e.key === "Backspace" && linhas[index] === "" && index > 0) {
      e.preventDefault();
      currentRef.current?.[index - 1]?.focus();
    }
    if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      currentRef.current?.[index - 1]?.focus();
    }
    if (e.key === "ArrowDown" && index < TOTAL_LINES - 1) {
      e.preventDefault();
      currentRef.current?.[index + 1]?.focus();
    }
  };

  return (
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
            darkMode ? "border-zinc-700 bg-zinc-750" : "border-stone-200 bg-stone-50"
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

        {/* Writing Area */}
        <div className="relative px-4 py-6" style={{ containerType: "inline-size" }}>
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
                    darkMode ? "border-zinc-700/50" : "border-stone-300/60"
                  } ${
                    structure
                      ? `${structureColors[structure].bg} ${structureColors[structure].border} border-l-4`
                      : ""
                  }`}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onToggleLineStructure(lineNum - 1)}
                        className={`relative z-10 w-8 flex-shrink-0 text-right pr-3 font-mono text-xs transition-colors cursor-pointer hover:opacity-70 ${
                          hasText
                            ? darkMode
                              ? "text-blue-400"
                              : "text-blue-600"
                            : darkMode
                              ? "text-zinc-500"
                              : "text-stone-400"
                        } ${
                          selectedStructure ? "ring-2 ring-inset ring-transparent hover:ring-current rounded" : ""
                        }`}
                      >
                        {String(lineNum).padStart(2, "0")}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Selecione uma estrutura</p>
                    </TooltipContent>
                  </Tooltip>

                  <input
                    ref={(el: HTMLInputElement | null) => {
                      const currentRef = inputsRef as any;
                      if (currentRef.current) {
                        currentRef.current[index] = el;
                      }
                    }}
                    value={linha}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    spellCheck={false}
                    onScroll={(e) => (e.currentTarget.scrollLeft = 0)}
                    className={`flex-1 w-full bg-transparent outline-none font-mono pl-2 pr-8 overflow-hidden ${
                      darkMode ? "text-zinc-200 caret-blue-400" : "text-stone-800 caret-blue-600"
                    } ${
                      hasError ? "underline decoration-red-400 decoration-wavy underline-offset-4" : ""
                    }`}
                    style={{
                      fontSize: "clamp(10px, calc((100cqi - 72px) / 47.4), 16px)",
                    }}
                  />

                  {/* Error Popover */}
                  {hasError && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`absolute right-0 hover:scale-110 transition-transform cursor-help px-1 rounded ${
                            darkMode
                              ? "text-amber-400 bg-zinc-800/80"
                              : "text-amber-600 bg-white/80"
                          }`}
                        >
                          <AlertCircle size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className={`w-72 p-3 shadow-xl z-50 ${
                          darkMode
                            ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                            : "bg-white"
                        }`}
                      >
                        <div className="text-xs space-y-3">
                          <p className="font-bold border-b pb-1 dark:border-zinc-700">
                            Sugestões de Correção
                          </p>
                          {alertasPorLinha[index].map((alerta, aIdx) => (
                            <div
                              key={aIdx}
                              className={`p-2 rounded border ${
                                darkMode
                                  ? "bg-zinc-900/50 border-zinc-700"
                                  : "bg-stone-50"
                              }`}
                            >
                              <p
                                className={`italic mb-1 ${
                                  darkMode
                                    ? "text-zinc-400"
                                    : "text-stone-500"
                                }`}
                              >
                                "{alerta.textoErro}"
                              </p>
                              <p className="mb-2">{alerta.message}</p>
                              <div className="flex flex-wrap gap-1">
                                {alerta.replacements
                                  .slice(0, 3)
                                  .map((rep: any, rIdx: number) => (
                                    <Button
                                      key={rIdx}
                                      size="sm"
                                      variant="secondary"
                                      className={`h-6 text-[10px] ${
                                        darkMode
                                          ? "bg-zinc-700 hover:bg-zinc-600"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        onAplicarSugestao(
                                          index,
                                          alerta.textoErro,
                                          rep.value
                                        )
                                      }
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

          {/* Margin indicator */}
          <div
            className={`absolute left-12 top-0 bottom-0 w-px z-0 ${
              darkMode ? "bg-red-500/20" : "bg-red-400/30"
            }`}
          />
        </div>
      </div>
    </motion.main>
  );
}
