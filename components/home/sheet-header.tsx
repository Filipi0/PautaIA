"use client";

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Download,
  Moon,
  Sun,
  FileText,
  Info,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SheetHeaderProps {
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  onClearClick: () => void;
  onExportPDF: () => void;
  occupiedLines: number;
  onAICorrection: () => void;
}

export function SheetHeader({
  darkMode,
  onDarkModeChange,
  onClearClick,
  onExportPDF,
  occupiedLines,
  onAICorrection,
}: SheetHeaderProps) {
  const { isSignedIn } = useAuth();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
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
              onCheckedChange={onDarkModeChange}
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
            onClick={onClearClick}
            className={
              darkMode ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : ""
            }
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>

          <Button
            onClick={onExportPDF}
            className={darkMode ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>

          {!isSignedIn && (
            <SignInButton>
              <Button className="bg-stone-800 text-white hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200">
                Fazer Login
              </Button>
            </SignInButton>
          )}

          {isSignedIn && (
            <>
              <Button
                onClick={onAICorrection}
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
                      - Contagem de linhas, palavras e caracteres em tempo real
                    </li>
                    <li>
                      - Marcadores de estrutura (Introdução, Desenvolvimento,
                      Conclusão)
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
  );
}
