"use client";

import { motion } from "framer-motion";
import { AlignLeft, Calendar, Pencil, Download, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Redacao, structureColors } from "./constants";
import { useRouter } from "next/navigation"; // <-- ADICIONE O IMPORT

interface RedacaoCardProps {
  redacao: Redacao;
  darkMode: boolean;
  onDelete: (id: string) => void;
  index: number;
}

export function RedacaoCard({
  redacao,
  darkMode,
  onDelete,
  index,
}: RedacaoCardProps) {
  const router = useRouter(); // <-- INICIALIZE O ROUTER
  const getStructureBar = (estrutura: Redacao["estrutura"], linhas: number) => {
    const total =
      estrutura.intro + estrutura.dev1 + estrutura.dev2 + estrutura.conclusao;
    if (total === 0) return null;

    return (
      <div className="flex h-2 w-full rounded-full overflow-hidden">
        {estrutura.intro > 0 && (
          <div
            className={structureColors.intro}
            style={{ width: `${(estrutura.intro / linhas) * 100}%` }}
          />
        )}
        {estrutura.dev1 > 0 && (
          <div
            className={structureColors.dev1}
            style={{ width: `${(estrutura.dev1 / linhas) * 100}%` }}
          />
        )}
        {estrutura.dev2 > 0 && (
          <div
            className={structureColors.dev2}
            style={{ width: `${(estrutura.dev2 / linhas) * 100}%` }}
          />
        )}
        {estrutura.conclusao > 0 && (
          <div
            className={structureColors.conclusao}
            style={{ width: `${(estrutura.conclusao / linhas) * 100}%` }}
          />
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Card
        className={`group h-full transition-all duration-300 hover:shadow-lg ${darkMode ? "bg-zinc-800 border-zinc-700 hover:border-zinc-600" : "bg-white border-stone-200 hover:border-stone-300"}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle
              className={`text-base leading-snug line-clamp-2 ${darkMode ? "text-white" : "text-stone-800"}`}
            >
              {redacao.tema}
            </CardTitle>
            <Badge
              className={`shrink-0 ${redacao.status === "concluida" ? "bg-green-500/20 text-green-600 border-green-500/30" : "bg-amber-500/20 text-amber-600 border-amber-500/30"}`}
            >
              {redacao.status === "concluida" ? "Concluída" : "Em rascunho"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-1.5 text-sm ${darkMode ? "text-zinc-400" : "text-stone-500"}`}
            >
              <AlignLeft className="w-4 h-4" />
              <span>
                {redacao.linhas}/{redacao.totalLinhas} linhas
              </span>
            </div>
            <div
              className={`flex items-center gap-1.5 text-sm ${darkMode ? "text-zinc-400" : "text-stone-500"}`}
            >
              <Calendar className="w-4 h-4" />
              <span>{redacao.dataEdicao}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${darkMode ? "text-zinc-500" : "text-stone-400"}`}
              >
                Estrutura:
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span
                    className={`text-xs ${darkMode ? "text-zinc-400" : "text-stone-500"}`}
                  >
                    I
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span
                    className={`text-xs ${darkMode ? "text-zinc-400" : "text-stone-500"}`}
                  >
                    D1
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span
                    className={`text-xs ${darkMode ? "text-zinc-400" : "text-stone-500"}`}
                  >
                    D2
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span
                    className={`text-xs ${darkMode ? "text-zinc-400" : "text-stone-500"}`}
                  >
                    C
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`rounded-full overflow-hidden ${darkMode ? "bg-zinc-700" : "bg-stone-200"}`}
            >
              {getStructureBar(redacao.estrutura, redacao.linhas)}
            </div>
          </div>
        </CardContent>

        <CardFooter
          className={`border-t pt-4 ${darkMode ? "border-zinc-700" : "border-stone-100"}`}
        >
          <div className="flex items-center gap-2 w-full">
            <Button
              onClick={() => router.push(`/?editId=${redacao.id}`)} // <-- REDIRECIONAMENTO COM ID
              variant="outline"
              size="sm"
              className="..."
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 ${darkMode ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white" : "border-stone-200 text-stone-600 hover:bg-stone-100"}`}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(redacao.id)}
              className={`shrink-0 ${darkMode ? "border-zinc-600 text-red-400 hover:bg-red-900/30 hover:border-red-700" : "border-stone-200 text-red-500 hover:bg-red-50 hover:border-red-200"}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
