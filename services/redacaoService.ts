// services/redacaoService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const redacaoService = {
  // Buscar todas as redações
  listar: async (token: string) => {
    const response = await fetch(`${API_URL}/redacoes`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Falha ao buscar redações");
    }

    return response.json();
  },

  // Salvar nova redação
  salvar: async (token: string, payload: any) => {
    const response = await fetch(`${API_URL}/redacoes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Falha ao salvar redação");
    }

    return response.json();
  },

  // Deletar redação (Já deixamos pronto pro botão de lixeira!)
  deletar: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/redacoes/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Falha ao deletar redação");
    }

    return response.json();
  },

  // Buscar UMA redação específica pelo ID
  buscarPorId: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/redacoes/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Falha ao buscar a redação");
    return response.json();
  },

  // Atualizar uma redação existente (PUT)
  atualizar: async (token: string, id: string, payload: any) => {
    const response = await fetch(`${API_URL}/redacoes/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Falha ao atualizar redação");
    }

    return response.json();
  },
};