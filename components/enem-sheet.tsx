"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trash2,
  Download,
  Moon,
  Sun,
  FileText,
  Type,
  AlignLeft,
  Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const TOTAL_LINES = 30
const CHARS_PER_LINE = 79

type StructureType = "intro" | "dev1" | "dev2" | "conclusion" | null

interface LineStructure {
  [key: number]: StructureType
}

const structureColors: Record<string, { bg: string; border: string; label: string }> = {
  intro: { bg: "bg-blue-500/20", border: "border-l-blue-500", label: "Introdução" },
  dev1: { bg: "bg-green-500/20", border: "border-l-green-500", label: "Desenvolvimento 1" },
  dev2: { bg: "bg-amber-500/20", border: "border-l-amber-500", label: "Desenvolvimento 2" },
  conclusion: { bg: "bg-purple-500/20", border: "border-l-purple-500", label: "Conclusão" },
}

export function EnemSheet() {
  const [text, setText] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [theme, setTheme] = useState("")
  const [lineStructures, setLineStructures] = useState<LineStructure>({})
  const [selectedStructure, setSelectedStructure] = useState<StructureType>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  const lines = text.split("\n")
  const occupiedLines = lines.filter((line) => line.trim().length > 0).length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    let newLines = newText.split("\n")
    
    // Processar linhas que ultrapassam o limite de caracteres
    const processedLines: string[] = []
    for (let i = 0; i < newLines.length; i++) {
      let line = newLines[i]
      
      while (line.length > CHARS_PER_LINE) {
        // Encontrar o último espaço antes do limite para quebra de linha suave
        let breakPoint = CHARS_PER_LINE
        const lastSpace = line.lastIndexOf(" ", CHARS_PER_LINE)
        
        if (lastSpace > 0 && lastSpace > CHARS_PER_LINE - 20) {
          breakPoint = lastSpace
        }
        
        processedLines.push(line.substring(0, breakPoint))
        line = line.substring(breakPoint).trimStart()
      }
      
      processedLines.push(line)
    }
    
    // Verificar se não ultrapassou o limite total de linhas
    if (processedLines.length <= TOTAL_LINES) {
      setText(processedLines.join("\n"))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const currentLines = text.split("\n")
      if (currentLines.length >= TOTAL_LINES) {
        e.preventDefault()
      }
    }

    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const indentSize = 4
      const indent = " ".repeat(indentSize)

      const newText = text.substring(0, start) + indent + text.substring(end)
      setText(newText)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indentSize
      }, 0)
    }
  }

  const clearSheet = () => {
    setText("")
    setTheme("")
    setLineStructures({})
  }

  const toggleLineStructure = (lineIndex: number) => {
    if (selectedStructure) {
      setLineStructures((prev) => ({
        ...prev,
        [lineIndex]: prev[lineIndex] === selectedStructure ? null : selectedStructure,
      }))
    }
  }

  const exportToPDF = useCallback(async () => {
    if (!sheetRef.current) return

    const html2canvas = (await import("html2canvas")).default
    const jsPDF = (await import("jspdf")).default

    const canvas = await html2canvas(sheetRef.current, {
      scale: 2,
      backgroundColor: darkMode ? "#1a1a1a" : "#faf8f5",
      logging: false,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    pdf.save("redacao-enem.pdf")
  }, [darkMode])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-zinc-900" : "bg-stone-200"
      }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
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
                  onCheckedChange={setDarkMode}
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
                onClick={clearSheet}
                className={darkMode ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : ""}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </Button>

              <Button
                onClick={exportToPDF}
                className={darkMode ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </motion.header>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Structure Selector */}
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
                        setSelectedStructure(selectedStructure === type ? null : type)
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
                  darkMode ? "bg-zinc-700 text-zinc-300" : "bg-stone-100 text-stone-600"
                }`}
              >
                Clique nos números das linhas para marcar como{" "}
                <span className="font-semibold">
                  {structureColors[selectedStructure].label}
                </span>
              </motion.p>
            )}
          </motion.aside>

          {/* Main Sheet */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1"
          >
            <div
              ref={sheetRef}
              className={`relative rounded-lg shadow-2xl overflow-hidden ${
                darkMode ? "bg-zinc-800" : "bg-white"
              }`}
            >
              {/* Sheet Header - Theme Input */}
              <div
                className={`px-6 py-4 border-b ${
                  darkMode ? "border-zinc-700 bg-zinc-750" : "border-stone-200 bg-stone-50"
                }`}
              >
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Digite o tema..."
                  className={`w-full text-sm px-3 py-2 rounded border transition-colors font-semibold ${
                    darkMode
                      ? "bg-zinc-700 border-zinc-600 text-zinc-200 placeholder-zinc-500 focus:border-blue-400"
                      : "bg-white border-stone-300 text-stone-700 placeholder-stone-400 focus:border-blue-500"
                  } focus:outline-none`}
                  aria-label="Tema da redação"
                />
              </div>

              {/* Writing Area */}
              <div className="relative px-4 py-6">
                {/* Line Numbers and Lines */}
                <div className="relative">
                  {Array.from({ length: TOTAL_LINES }, (_, i) => i + 1).map(
                    (lineNum) => {
                      const structure = lineStructures[lineNum - 1]
                      const hasText = lines[lineNum - 1]?.trim().length > 0

                      return (
                        <div
                          key={lineNum}
                          className={`flex items-center h-[28px] border-b transition-colors ${
                            darkMode
                              ? "border-zinc-700/50"
                              : "border-stone-300/60"
                          } ${
                            structure
                              ? `${structureColors[structure].bg} ${structureColors[structure].border} border-l-4`
                              : ""
                          }`}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleLineStructure(lineNum - 1)}
                                className={`relative z-10 w-8 flex-shrink-0 text-right pr-3 font-mono text-xs transition-colors cursor-pointer hover:opacity-70 ${
                                  hasText
                                    ? darkMode
                                      ? "text-blue-400"
                                      : "text-blue-600"
                                    : darkMode
                                    ? "text-zinc-500"
                                    : "text-stone-400"
                                } ${selectedStructure ? "ring-2 ring-inset ring-transparent hover:ring-current rounded" : ""}`}
                              >
                                {lineNum}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>
                                {selectedStructure
                                  ? `Marcar como ${structureColors[selectedStructure].label}`
                                  : "Selecione uma estrutura primeiro"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          {/* <div
                            className={`flex-1 mx-2 h-full border-l ${
                              darkMode ? "border-zinc-600/30" : "border-stone-300/40"
                            }`}
                          /> */}
                        </div>
                      )
                    }
                  )}

                  {/* Textarea Overlay */}
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    className={`absolute inset-0 w-full h-full resize-none bg-transparent font-mono text-sm leading-[28px] pl-9 pr-2 py-0 focus:outline-none ${
                      darkMode ? "text-zinc-200 caret-blue-400" : "text-stone-800 caret-blue-600"
                    }`}
                    style={{
                      lineHeight: "28px",
                    }}
                    placeholder="Comece a escrever sua redação aqui..."
                    aria-label="Área de escrita da redação"
                  />
                </div>

                {/* Margin indicators */}
                <div
                  className={`absolute left-12 top-0 bottom-0 w-px ${
                    darkMode ? "bg-red-500/20" : "bg-red-400/30"
                  }`}
                />
              </div>

              {/* Sheet Footer */}
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
                        Palavras:{" "}
                        <span className="font-semibold">{wordCount}</span>
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 text-xs ${
                        darkMode ? "text-zinc-400" : "text-stone-600"
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                      <span>
                        Caracteres:{" "}
                        <span className="font-semibold">{charCount}</span>
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
          </motion.main>
        </div>
      </div>
    </div>
  )
}
