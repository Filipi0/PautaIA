export interface Redacao {
  id: string
  tema: string
  status: "concluida" | "rascunho"
  linhas: number
  totalLinhas: number
  dataEdicao: string
  estrutura: {
    intro: number
    dev1: number
    dev2: number
    conclusao: number
  }
}

export const structureColors = {
  intro: "bg-blue-500",
  dev1: "bg-green-500",
  dev2: "bg-amber-500",
  conclusao: "bg-purple-500",
}

export const mockRedacoes: Redacao[] = [
  {
    id: "1",
    tema: "A persistência da violência contra a mulher no Brasil",
    status: "concluida",
    linhas: 28,
    totalLinhas: 30,
    dataEdicao: "27/03/2026",
    estrutura: { intro: 5, dev1: 8, dev2: 8, conclusao: 7 },
  },
  {
    id: "2",
    tema: "Os desafios da educação inclusiva no Brasil",
    status: "concluida",
    linhas: 30,
    totalLinhas: 30,
    dataEdicao: "25/03/2026",
    estrutura: { intro: 6, dev1: 9, dev2: 8, conclusao: 7 },
  },
  {
    id: "3",
    tema: "O estigma associado às doenças mentais na sociedade brasileira",
    status: "rascunho",
    linhas: 15,
    totalLinhas: 30,
    dataEdicao: "24/03/2026",
    estrutura: { intro: 5, dev1: 7, dev2: 3, conclusao: 0 },
  },
  {
    id: "4",
    tema: "A democratização do acesso ao cinema no Brasil",
    status: "rascunho",
    linhas: 8,
    totalLinhas: 30,
    dataEdicao: "22/03/2026",
    estrutura: { intro: 4, dev1: 4, dev2: 0, conclusao: 0 },
  },
  {
    id: "5",
    tema: "Os impactos da inteligência artificial no mercado de trabalho",
    status: "concluida",
    linhas: 29,
    totalLinhas: 30,
    dataEdicao: "20/03/2026",
    estrutura: { intro: 5, dev1: 9, dev2: 9, conclusao: 6 },
  },
]