"use client";

import { motion } from "framer-motion";
import { AlignLeft, Save, Library, Loader2 } from "lucide-react";
import { StructureType, structureColors } from "./constants";

interface StructureSidebarProps {
  selectedStructure: StructureType;
  onStructureSelect: (type: StructureType) => void;
  darkMode: boolean;
  isSignedIn?: boolean;
  onSaveDraft: () => void;
  onViewEssays: () => void;
  isCarregandoEdicao?: boolean; // <-- NOVA PROPRIEDADE AQUI
}

export function StructureSidebar({
  selectedStructure,
  onStructureSelect,
  darkMode,
  isSignedIn,
  onSaveDraft,
  onViewEssays,
  isCarregandoEdicao,
}: StructureSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`lg:w-56 rounded-lg p-4 flex flex-col gap-6 ${
        darkMode ? "bg-zinc-800" : "bg-white shadow-md"
      }`}
    >
      {/* SEÇÃO 1: ESTRUTURA (Original) */}
      <div>
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
                    onStructureSelect(selectedStructure === type ? null : type)
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
              )
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
            Clique nas linhas para marcar como{" "}
            <span className="font-semibold">
              {structureColors[selectedStructure].label}
            </span>
          </motion.p>
        )}
      </div>

      {/* SEÇÃO 2: GERENCIAMENTO (Nova) */}
      <div className={`pt-4 border-t ${darkMode ? "border-zinc-700" : "border-stone-200"}`}>
        <h2
          className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
            darkMode ? "text-zinc-300" : "text-stone-700"
          }`}
        >
          <Library className="w-4 h-4" />
          Meu Painel
        </h2>
        
        <div className="space-y-2">
          <button
            onClick={onSaveDraft}
            // Desabilita se não tiver logado OU se estiver carregando a edição
            disabled={!isSignedIn || isCarregandoEdicao} 
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all border border-transparent ${
              !isSignedIn || isCarregandoEdicao
                ? "opacity-50 cursor-not-allowed bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-500"
                : darkMode
                ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            {/* Se estiver carregando, mostra o spinner. Se não, mostra o disquete */}
            {isCarregandoEdicao ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Rascunho
              </>
            )}
          </button>

          <button
            onClick={onViewEssays}
            disabled={!isSignedIn}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all border border-transparent ${
              !isSignedIn
                ? "opacity-50 cursor-not-allowed bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-500"
                : darkMode
                ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            <Library className="w-4 h-4" />
            Minhas Redações
          </button>
          
          {/* Mensagem de alerta se não estiver logado */}
          {!isSignedIn && (
            <p className="text-[10px] text-center mt-2 text-amber-500">
              Faça login para habilitar o salvamento.
            </p>
          )}
        </div>
      </div>

    </motion.aside>
  );
}