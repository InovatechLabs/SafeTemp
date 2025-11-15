export interface DataItem {
  id: number;
  chipId: string;
  value: string;
  timestamp: string;
};

export interface DataItemArray {
  records: DataItem[];
};

export interface Alert {
  id: number;
  temperatura_min: number;
  temperatura_max: number;
  hora_inicio: string | Date;
  hora_fim: string | Date;
  criado_em: string | Date;
}