"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Redacao, mockRedacoes } from "./dashboard/constants"
import { DashboardHeader } from "./dashboard/dashboard-header"
import { DashboardFilters } from "./dashboard/dashboard-filters"
import { RedacaoCard } from "./dashboard/redacao-card"
import { DashboardLegend } from "./dashboard/dashboard-legend"

export function DashboardRedacoes() {
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [redacoes, setRedacoes] = useState<Redacao[]>(mockRedacoes)

  const filteredRedacoes = redacoes.filter((redacao) => {
    const matchesSearch = redacao.tema.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || redacao.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = (id: string) => {
    setRedacoes((prev) => prev.filter((r) => r.id !== id))
  }

  const handleNewRedacao = () => {
    window.location.href = "/"
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? "bg-zinc-900" : "bg-stone-200"}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        <DashboardHeader 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          onNewRedacao={handleNewRedacao} 
        />

        <DashboardFilters 
          darkMode={darkMode}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Grid de Cards ou Empty State */}
        <AnimatePresence mode="popLayout">
          {filteredRedacoes.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredRedacoes.map((redacao, index) => (
                <RedacaoCard 
                  key={redacao.id}
                  redacao={redacao}
                  darkMode={darkMode}
                  onDelete={handleDelete}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex flex-col items-center justify-center py-16 px-4 rounded-lg ${darkMode ? "bg-zinc-800" : "bg-white shadow-md"}`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${darkMode ? "bg-zinc-700" : "bg-stone-100"}`}>
                <FileText className={`w-10 h-10 ${darkMode ? "text-zinc-500" : "text-stone-400"}`} />
              </div>
              <h2 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-stone-800"}`}>
                Nenhuma redação encontrada
              </h2>
              <p className={`text-center mb-6 max-w-md ${darkMode ? "text-zinc-400" : "text-stone-500"}`}>
                {searchTerm || statusFilter !== "todos"
                  ? "Nenhuma redação corresponde aos filtros aplicados. Tente ajustar sua busca."
                  : "Você ainda não praticou. Comece sua primeira redação agora!"}
              </p>
              {!searchTerm && statusFilter === "todos" && (
                <Button onClick={handleNewRedacao} className={`${darkMode ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"} text-white`}>
                  <Plus className="w-4 h-4 mr-2" /> Começar agora
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredRedacoes.length > 0 && <DashboardLegend darkMode={darkMode} />}
        
      </div>
    </div>
  )
}