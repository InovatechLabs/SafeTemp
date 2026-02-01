export interface StatsData {
  media: number;
  mediaNoOutlier: number;
  mediana: number;
  medianaNoOutlier: number;
  desvioPadrao: number;
  min: number;
  max: number;
  variancia: number;
  CVOutlier: number;
  CVNoOutlier: number;
  outliers: number[];
  totalOutliers: number;
  totalRecords: number;
}

export interface ComparisonMetric {
  absolute: number;
  percentage: number | null;
}

export interface ComparisonResponse {
  rangeA: {
    interval: string;
    totalRecords: number;
    statistics: StatsData;
  };
  rangeB: {
    interval: string;
    totalRecords: number;
    statistics: StatsData;
  };
  comparison: {
    metrics: {
      media: ComparisonMetric;
      mediana: ComparisonMetric;
      variancia: ComparisonMetric;
      desvioPadrao: ComparisonMetric;
      CVOutlier: ComparisonMetric;
      CVNoOutlier: ComparisonMetric;
      amplitude: ComparisonMetric;
    };
    analysis: {
      moreStable: 'A' | 'B' | 'equal';
      lowerVariability: 'A' | 'B' | 'equal';
      moreOutliers: 'A' | 'B' | 'equal';
      percentualChangeMedia: number;
      percentualChangeVariancia: number;
    };
  };
  balanceAnalysis: {
    recordsA: number;
    recordsB: number;
    ratio: number;
    imbalanceLevel: string;
    reliability: 'baixa' | 'media' | 'alta';
  };
  summary: {
    headline: string;
    confidence: "alta" | "média" | "baixa";
    highlights: string[];
    tags: string[];
  }
}