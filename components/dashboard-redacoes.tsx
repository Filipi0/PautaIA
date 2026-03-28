"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Plus, Loader2 } from "lucide-react" // <-- Adicionado Loader2
import { Button } from "@/components/ui/button"
import { useSession } from "@clerk/nextjs" // <-- Importe do Clerk

import { redacaoService } from "@/services/redacaoService"
import { Redacao } from "./dashboard/constants" // Removido o mockRedacoes
import { DashboardHeader } from "./dashboard/dashboard-header"
import { DashboardFilters } from "./dashboard/dashboard-filters"
import { RedacaoCard } from "./dashboard/redacao-card"
import { DashboardLegend } from "./dashboard/dashboard-legend"

export function DashboardRedacoes() {
  const { session } = useSession() // Pega a sessão para usar o token JWT
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  
  // Estados para gerenciar os dados reais da API
  const [redacoes, setRedacoes] = useState<Redacao[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // BUSCA OS DADOS DA API QUANDO A TELA CARREGAR
  useEffect(() => {
    async function fetchRedacoes() {
      if (!session) return

      try {
        const token = await session.getToken()
        const dadosDoBanco = await redacaoService.listar(token as string)

        const redacoesFormatadas: Redacao[] = dadosDoBanco.map((pauta: any) => ({
          id: pauta.id.toString(),
          tema: pauta.tema,
          // Lógica simples: se tem corpo e mais de 7 linhas, consideramos concluída
          status: pauta.corpo.trim().length > 0 && pauta.totalLinhas >= 7 ? "concluida" : "rascunho",
          linhas: pauta.totalLinhas,
          totalLinhas: 30,
          dataEdicao: new Date(pauta.updatedAt).toLocaleDateString("pt-BR"),
          estrutura: pauta.structure_map ? pauta.structure_map : { intro: 0, dev1: 0, dev2: 0, conclusao: 0 }
        }))

        setRedacoes(redacoesFormatadas)
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRedacoes()
  }, [session])

  const filteredRedacoes = redacoes.filter((redacao) => {
    const matchesSearch = redacao.tema.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || redacao.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // DELETA A REDAÇÃO NO BANCO E DEPOIS TIRA DA TELA
  const handleDelete = async (id: string) => {
    if (!session) return

    try {
      const token = await session.getToken()
      await redacaoService.deletar(token as string, id)
      
      // Atualiza o estado removendo o card que acabou de ser deletado
      setRedacoes((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error("Erro ao deletar:", error)
      alert("Não foi possível deletar a redação.")
    }
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

        {/* CONTROLE DE CARREGAMENTO */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? "text-zinc-500" : "text-stone-400"}`} />
          </div>
        ) : (
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
        )}

        {!isLoading && filteredRedacoes.length > 0 && <DashboardLegend darkMode={darkMode} />}
        
      </div>
    </div>
  )
}