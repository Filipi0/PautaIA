"use client";

import { motion } from "framer-motion";
import { AlignLeft } from "lucide-react";
import { StructureType, structureColors } from "./constants";

interface StructureSidebarProps {
  selectedStructure: StructureType;
  onStructureSelect: (type: StructureType) => void;
  darkMode: boolean;
}

export function StructureSidebar({
  selectedStructure,
  onStructureSelect,
  darkMode,
}: StructureSidebarProps) {
  return (
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
          Clique nos números das linhas para marcar como{" "}
          <span className="font-semibold">
            {structureColors[selectedStructure].label}
          </span>
        </motion.p>
      )}
    </motion.aside>
  );
}
