export interface Statistics {
  statistics: {
    media: number;
    mediana: number;
    min: number;
    max: number;
  };
  pieData: { name: string; value: number; color: string }[];
}