"use client"

import { motion } from "framer-motion"
import { FileText, Sun, Moon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface DashboardHeaderProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  onNewRedacao: () => void
}

export function DashboardHeader({ darkMode, setDarkMode, onNewRedacao }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FileText className={`w-8 h-8 ${darkMode ? "text-white" : "text-stone-800"}`} />
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-stone-800"}`}>
            Minhas Práticas
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className={`w-4 h-4 ${darkMode ? "text-zinc-400" : "text-amber-500"}`} />
            <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label="Alternar modo escuro" />
            <Moon className={`w-4 h-4 ${darkMode ? "text-blue-400" : "text-zinc-400"}`} />
          </div>

          <Button
            onClick={onNewRedacao}
            className={`${
              darkMode
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            } text-white`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Redação
          </Button>
        </div>
      </div>
    </motion.header>
  )
}