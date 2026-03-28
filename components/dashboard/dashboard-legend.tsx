"use client"

import { motion } from "framer-motion"

interface DashboardLegendProps {
  darkMode: boolean
}

export function DashboardLegend({ darkMode }: DashboardLegendProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={`mt-8 p-4 rounded-lg ${darkMode ? "bg-zinc-800" : "bg-white shadow-md"}`}
    >
      <h3 className={`text-sm font-medium mb-3 ${darkMode ? "text-zinc-300" : "text-stone-700"}`}>
        Legenda da Estrutura
      </h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className={`text-sm ${darkMode ? "text-zinc-400" : "text-stone-600"}`}>Introdução</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className={`text-sm ${darkMode ? "text-zinc-400" : "text-stone-600"}`}>Desenvolvimento 1</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className={`text-sm ${darkMode ? "text-zinc-400" : "text-stone-600"}`}>Desenvolvimento 2</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span className={`text-sm ${darkMode ? "text-zinc-400" : "text-stone-600"}`}>Conclusão</span></div>
      </div>
    </motion.div>
  )
}