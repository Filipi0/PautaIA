export const TOTAL_LINES = 30;
export const CHARS_PER_LINE = 80;

export type StructureType = "intro" | "dev1" | "dev2" | "conclusion" | null;

export interface LineStructure {
  [key: number]: StructureType;
}

export const structureColors: Record<
  string,
  { bg: string; border: string; label: string }
> = {
  intro: {
    bg: "bg-blue-200/20",
    border: "border-l-blue-500",
    label: "Introdução",
  },
  dev1: {
    bg: "bg-green-200/20",
    border: "border-l-green-500",
    label: "Desenvolvimento 1",
  },
  dev2: {
    bg: "bg-amber-200/20",
    border: "border-l-amber-500",
    label: "Desenvolvimento 2",
  },
  conclusion: {
    bg: "bg-purple-200/20",
    border: "border-l-purple-500",
    label: "Conclusão",
  },
};
