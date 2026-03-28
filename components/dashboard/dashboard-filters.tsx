"use client"

import { motion } from "framer-motion"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface DashboardFiltersProps {
  darkMode: boolean
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
}

export function DashboardFilters({
  darkMode, searchTerm, setSearchTerm, statusFilter, setStatusFilter
}: DashboardFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`mb-6 p-4 rounded-lg ${darkMode ? "bg-zinc-800" : "bg-white shadow-md"}`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-zinc-400" : "text-stone-400"}`} />
          <Input
            type="text"
            placeholder="Buscar por tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${darkMode ? "bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400" : "bg-stone-50 border-stone-200"}`}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${darkMode ? "text-zinc-400" : "text-stone-500"}`} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={`w-[180px] ${darkMode ? "bg-zinc-700 border-zinc-600 text-white" : "bg-stone-50 border-stone-200"}`}>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className={darkMode ? "bg-zinc-800 border-zinc-700" : ""}>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="concluida">Concluídas</SelectItem>
              <SelectItem value="rascunho">Em rascunho</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  )
}