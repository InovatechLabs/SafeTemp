export interface ExperimentoAtivo {
  id: number;
  nome: string;
  objetivo: string;
  temp_min_ideal: number;
  temp_max_ideal: number;
  responsavel: { name: string };
  data_inicio: string;
};