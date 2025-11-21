export interface ApiReport {
  id: number;
  chip_id: string;
  data: string; 
  relatorio: string;
  resumo: string; 
  criado_em: string;
};

export interface ReportUIModel {
  id: string;
  title: string;
  time: string;
  summaryText: string;
   
  fullData: {
    text: string;
    stats: any;
    meta: {
      chipId: string;
      date: string;
      criado_em: string;
    }
  }
};

export interface ReportStats {
  media?: number;
  min?: number;
  max?: number;
  std?: number;
  variancia?: number;
  totalOutliers?: number;
  registros?: number;
}