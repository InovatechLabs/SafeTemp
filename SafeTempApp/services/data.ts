import api from "./api"; 

export interface DataItem {
  id: number;
  chipId: string;
  value: string;
  timestamp: string;
}

// Função para buscar todos os dados
export const fetchLastData = async (): Promise<DataItem> => {
  try {
    const response = await api.get<DataItem>("/data/lastdata");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar último dado:", error);
    throw error;
  }
};