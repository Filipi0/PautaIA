"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Hash, Type, AlignLeft } from "lucide-react";
import { TOTAL_LINES, structureColors } from "./constants";

interface SheetFooterProps {
  occupiedLines: number;
  wordCount: number;
  charCount: number;
  darkMode: boolean;
}

export function SheetFooter({
  occupiedLines,
  wordCount,
  charCount,
  darkMode,
}: SheetFooterProps) {
  return (
    <>
      {/* Footer with Statistics */}
      <div
        className={`px-6 py-3 border-t ${
          darkMode ? "border-zinc-700 bg-zinc-750" : "border-stone-200 bg-stone-50"
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
                Palavras: <span className="font-semibold">{wordCount}</span>
              </span>
            </div>

            <div
              className={`flex items-center gap-1.5 text-xs ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>
                Caracteres: <span className="font-semibold">{charCount}</span>
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

      {/* Structure Legend */}
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
    </>
  );
}
