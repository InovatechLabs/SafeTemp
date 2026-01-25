export interface Experimento {
  id: number;
  nome: string;
  objetivo: string | null;
  data_inicio: string;
  data_fim: string;
  relatorio: string | null;
  temp_min_ideal: number;
  temp_max_ideal: number;
  responsavel: {
    name: string; 
  };
  dispositivo: {
    mac_address: string;
  };
};

export interface ExperimentoAtivo {
  id: number;
  nome: string;
  objetivo: string;
  temp_min_ideal: number;
  temp_max_ideal: number;
  responsavel: { name: string };
  data_inicio: string;
};