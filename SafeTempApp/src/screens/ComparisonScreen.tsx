import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, Alert, TouchableOpacity, Modal, DimensionValue } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ComparisonResponse } from '../../src/utils/types/comparison/index';
import api from '../../services/api'; 
import { LineChart } from 'react-native-chart-kit';
import ComparisonSummaryCard from '../components/comparison/ComparisonSummaryCard';

export interface HistoryPoint {
  timestamp: string;   // ISO string
  value: number;       // temperatura (média se granular)
  samples?: number;    // quantos registros formaram o ponto (opcional)
}

const ComparisonScreen = () => {
const [data, setData] = useState<ComparisonResponse | null>(null);
const [seriesA, setSeriesA] = useState<HistoryPoint[]>([]);
const [seriesB, setSeriesB] = useState<HistoryPoint[]>([]);
const [loading, setLoading] = useState(true);
const [tooltipVisible, setTooltipVisible] = useState(false);
const [tooltipData, setTooltipData] = useState({ title: '', description: '' });

const showTooltip = (label: string) => {
  setTooltipData({
    title: label,
    description: STATS_EXPLANATIONS[label as keyof typeof STATS_EXPLANATIONS] || "Métrica comparativa entre os períodos."
  });
  setTooltipVisible(true);
};

const getReliabilityConfig = (reliability: string) => {
  switch (reliability) {
    case 'boa':
      return { color: '#10B981', bg: '#F0FDF4', icon: 'check-decagram' as const, label: 'Dados Confiáveis' };
    case 'limitada':
      return { color: '#F59E0B', bg: '#FFFBEB', icon: 'alert-decagram' as const, label: 'Confiabilidade Limitada' };
    case 'baixa':
      return { color: '#EF4444', bg: '#FEF2F2', icon: 'shield-alert' as const, label: 'Atenção: Baixa Confiabilidade' };
    default:
      return { color: '#64748B', bg: '#F8FAFC', icon: 'information' as const, label: 'Análise de Equilíbrio' };
  }
};

const formatTimeBRT = useCallback((timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);


const chartDataA = useMemo(() => ({
  labels: seriesA.map((_, i) => i % 5 === 0 ? formatTimeBRT(_.timestamp) : ""), 
  datasets: [{ data: seriesA.map(p => p.value) }]
}), [seriesA]);

const chartDataB = useMemo(() => ({
  labels: seriesB.map((_, i) => i % 5 === 0 ? formatTimeBRT(_.timestamp) : ""), 
  datasets: [{ data: seriesB.map(p => p.value) }]
}), [seriesB]);

const fetchComparison = async () => {
  try {
    setLoading(true);

    const granularity = '10m';

    const [comparisonRes, historyARes, historyBRes] = await Promise.all([
      api.post('comparison/compare', {
        rangeA: '2026-01-26',
        rangeB: '2026-01-29'
      }),
      api.get('data/history', {
        params: { date: '2026-01-26', granularity }
      }),
      api.get('data/history', {
        params: { date: '2026-01-29', granularity }
      })
    ]);

    setData(comparisonRes.data);
    setSeriesA(historyARes.data.records);
    setSeriesB(historyBRes.data.records);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchComparison();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A11CB" />
      </View>
    );
  };

  const config = data?.balanceAnalysis 
    ? getReliabilityConfig(data.balanceAnalysis.reliability) 
    : getReliabilityConfig('default');
    
  const ratioPercent = data?.balanceAnalysis 
    ? (data.balanceAnalysis.ratio * 100).toFixed(0) 
    : "0";


const smallChartConfigA = {
  backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 1, 
  color: (opacity = 1) => `rgba(106, 17, 203, ${opacity})`, 
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, 
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "0", 
  },
  propsForBackgroundLines: {
    strokeDasharray: "", 
    stroke: "#E2E8F0",
  }
};

const smallChartConfigB = {
  ...smallChartConfigA,
  color: (opacity = 1) => `rgba(206, 110, 70, ${opacity})`,
};

const allValues = [...seriesA.map(p => p.value), ...seriesB.map(p => p.value)];
const minY = Math.floor(Math.min(...allValues) - 1);
const maxY = Math.ceil(Math.max(...allValues) + 1);

const STATS_EXPLANATIONS = {
  "Média Térmica": "Representa o valor central das temperaturas. Útil para entender o patamar geral de calor na estufa.",
  "Variância": "Indica quão distantes os valores estão da média. Uma variância alta significa que a temperatura oscilou muito.",
  "Desvio Padrão": "Mostra a variação média em relação à média. É mais fácil de interpretar pois usa a mesma unidade (°C).",
  "Estabilidade (CV)": "O Coeficiente de Variação é a métrica definitiva: quanto menor o CV, mais estável foi o ambiente, independente da temperatura média."
};

const MetricRow = ({ label, metric, isLowerBetter = false }: any) => {
  if (!metric) return null;
  
  const isPositive = metric.absolute > 0;
  const color = isPositive ? '#EF4444' : '#10B981'; 
  const icon = isPositive ? 'arrow-up-right' : 'arrow-down-right';

  const handlePress = () => {
    showTooltip(label);
  };

return (
    <TouchableOpacity 
      style={styles.metricRow} 
      onPress={handlePress}
      activeOpacity={0.6}
    >
      <View style={styles.labelWithInfo}>
        <Text style={styles.metricLabel}>{label}</Text>
        <MaterialCommunityIcons name="information-outline" size={14} color="#94A3B8" />
      </View>
      
      <View style={styles.metricValueContainer}>
        <Text style={[styles.metricAbsolute, { color }]}>
          {isPositive ? '+' : ''}{metric.absolute.toFixed(2)}
        </Text>
        <View style={[styles.percentageBadge, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={12} color={color} />
          <Text style={[styles.percentageText, { color }]}>
            {Math.abs(metric.percentage).toFixed(1)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient colors={['#6A11CB', '#2575FC']} style={styles.header}>
        <Text style={styles.headerTitle}>Comparativo de Períodos</Text>
      </LinearGradient>
      <View style={styles.chartsWrapper}>
  <Text style={styles.sectionTitle}>Tendência Temporal</Text>
  
  <View style={styles.chartContainer}>
    <Text style={styles.chartLabel}>Série A (2026-01-26)</Text>
   <LineChart
          data={chartDataA}
          width={Dimensions.get('window').width - 50}
          height={160}
          chartConfig={smallChartConfigA}
          fromNumber={maxY}
          fromZero={false}
          segments={4}
          bezier
          withDots={false}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          yAxisSuffix="°"
          style={styles.chartStyle}
        />
  </View>

  <View style={[styles.chartContainer, { marginTop: 15 }]}>
    <Text style={styles.chartLabel}>Série B (2026-01-29)</Text>
<LineChart
          data={chartDataB}
          width={Dimensions.get('window').width - 50}
          height={160}
          chartConfig={smallChartConfigB}
          fromNumber={maxY}
          fromZero={false}
          segments={4}
          bezier
          withDots={false}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          yAxisSuffix="°"
          style={styles.chartStyle}
        />
  </View>
</View>

      <ComparisonSummaryCard summary={data?.summary} />

      <View style={styles.row}>
        <PeriodCard title="Período A" date={data?.rangeA.interval} stats={data?.rangeA.statistics} color="#F5F3FF" />
        <PeriodCard title="Período B" date={data?.rangeB.interval} stats={data?.rangeB.statistics} color="#FFF7ED" />
      </View>
 
   <View style={styles.analysisCard}>
  <View style={styles.cardHeader}>
    <Text style={styles.cardTitle}>Análise Estatística</Text>
    <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color="#6A11CB" />
  </View>

  {/* Badges de Veredito */}
  <View style={styles.badgeRow}>
    <View style={[styles.verdictBadge, { backgroundColor: '#F0FDF4' }]}>
      <MaterialCommunityIcons name="shield-check-outline" size={14} color="#166534" />
      <Text style={[styles.verdictText, { color: '#166534' }]}>
        Mais Estável: Período {data?.comparison.analysis.moreStable}
      </Text>
    </View>
    <View style={[styles.verdictBadge, { backgroundColor: '#EFF6FF' }]}>
      <MaterialCommunityIcons name="trending-down" size={14} color="#1E40AF" />
      <Text style={[styles.verdictText, { color: '#1E40AF' }]}>
        Menor Variação: {data?.comparison.analysis.lowerVariability}
      </Text>
    </View>
  </View>

  <View style={styles.metricsTable}>
    <MetricRow label="Média Térmica" metric={data?.comparison.metrics.media} />
    <View style={styles.tableDivider} />
    <MetricRow label="Mediana" metric={data?.comparison.metrics.mediana} />
    <View style={styles.tableDivider} />
    <MetricRow label="Variância" metric={data?.comparison.metrics.variancia} isLowerBetter />
    <View style={styles.tableDivider} />
    <MetricRow label="Desvio Padrão" metric={data?.comparison.metrics.desvioPadrao} isLowerBetter />
    <View style={styles.tableDivider} />
    <MetricRow label="Amplitude Total" metric={data?.comparison.metrics.amplitude} />
    <View style={styles.tableDivider} />
    <MetricRow label="Estabilidade (CV)" metric={data?.comparison.metrics.CVNoOutlier} isLowerBetter />
  </View>
  
  <Text style={styles.comparisonNote}>
    * Valores representam a mudança do Período A para o Período B.
  </Text>
</View>

    {data && (
          <View style={[styles.relCard, { borderTopColor: config.color }]}>
      <View style={styles.relHeader}>
        <View style={[styles.relBadge, { backgroundColor: config.bg }]}>
          <MaterialCommunityIcons name={config.icon} size={16} color={config.color} />
          <Text style={[styles.relBadgeText, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={styles.ratioValue}>{ratioPercent}% de paridade</Text>
      </View>

      <Text style={styles.relTitle}>Equilíbrio de Amostragem</Text>
      
      {/* Barra de Progresso de Ratio */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${ratioPercent}%` as DimensionValue, backgroundColor: config.color }]} />
      </View>

      <View style={styles.relFooter}>
        <View style={styles.relDetailItem}>
          <Text style={styles.relDetailLabel}>Período A</Text>
          <Text style={styles.relDetailValue}>{data?.rangeA.totalRecords} regs</Text>
        </View>
        <View style={styles.relDivider} />
        <View style={styles.relDetailItem}>
          <Text style={styles.relDetailLabel}>Período B</Text>
          <Text style={styles.relDetailValue}>{data?.rangeB.totalRecords} regs</Text>
        </View>
        <View style={styles.relDivider} />
        <View style={styles.relDetailItem}>
          <Text style={styles.relDetailLabel}>Desbalanceamento</Text>
          <Text style={styles.relDetailValue}>{data?.balanceAnalysis.imbalanceLevel}</Text>
        </View>
      </View>

      <View style={styles.relWarningBox}>
        <MaterialCommunityIcons 
          name={data?.balanceAnalysis.reliability === 'alta' ? "information-outline" : "alert-circle-outline"} 
          size={16} 
          color="#64748B" 
        />
        <Text style={styles.relWarningText}>
          {data?.balanceAnalysis.reliability === 'alta' 
            ? 'Os volumes de dados são equivalentes, permitindo uma análise estatística robusta.' 
            : `A diferença de volume entre os períodos (${data?.rangeA.totalRecords} vs ${data?.rangeB.totalRecords}) pode influenciar as médias.`}
        </Text>
      </View>
    </View>
    )}
      <Modal
  transparent={true}
  visible={tooltipVisible}
  animationType="fade"
  onRequestClose={() => setTooltipVisible(false)}
>
  <TouchableOpacity 
    style={styles.modalOverlay} 
    activeOpacity={1} 
    onPress={() => setTooltipVisible(false)}
  >
    <View style={styles.tooltipBalloon}>
      <View style={styles.tooltipHeader}>
        <Text style={styles.tooltipTitle}>{tooltipData.title}</Text>
        <MaterialCommunityIcons name="information" size={16} color="#6A11CB" />
      </View>
      <Text style={styles.tooltipDescription}>{tooltipData.description}</Text>
      <View style={styles.tooltipArrow} />
    </View>
  </TouchableOpacity>
</Modal>
    </ScrollView>
    
  );
};

const PeriodCard = ({ title, date, stats, color }: any) => (
  <View style={[styles.periodCard, { backgroundColor: color }]}>

    <View style={styles.periodHeader}>
      <View>
        <Text style={styles.periodLabel}>{title}</Text>
        <Text style={styles.periodDate}>{date}</Text>
      </View>
      <View style={styles.recordBadge}>
        <Text style={styles.recordBadgeText}>{stats?.totalRecords} registros</Text>
      </View>
    </View>

    <View style={styles.divider} />
    <View style={styles.statsGrid}>
      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="thermometer" size={14} color="#6A11CB" />
          <Text style={styles.gridValue}>{stats?.media.toFixed(1)}°C</Text>
          <Text style={styles.gridLabel}>Média</Text>
        </View>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="alert-decagram-outline" size={14} color="#EF4444" />
          <Text style={[styles.gridValue, { color: stats?.totalOutliers > 0 ? '#EF4444' : '#10B981' }]}>
            {stats?.totalOutliers}
          </Text>
          <Text style={styles.gridLabel}>Outliers</Text>
        </View>
      </View>

      <View style={[styles.gridRow, { marginTop: 12 }]}>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="arrow-down-bold-outline" size={14} color="#3B82F6" />
          <Text style={styles.gridValue}>{stats?.min.toFixed(1)}°</Text>
          <Text style={styles.gridLabel}>Min</Text>
        </View>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="arrow-up-bold-outline" size={14} color="#F59E0B" />
          <Text style={styles.gridValue}>{stats?.max.toFixed(1)}°</Text>
          <Text style={styles.gridLabel}>Max</Text>
        </View>
      </View>
    </View>
  </View>
);



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  row: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  periodTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  miniStatsGrid: { gap: 8 },
  miniStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniStatValue: { fontSize: 13, color: '#475569' },
  badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  metricDiff: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  diffLabel: { fontSize: 14, color: '#64748B' },
  diffValue: { fontSize: 16, fontWeight: 'bold', color: '#6A11CB', marginTop: 4 },
  reliabilityCard: { margin: 16, padding: 15, borderRadius: 15, borderWidth: 1, backgroundColor: '#FFF' },
  reliabilityTitle: { fontWeight: 'bold', marginBottom: 5 },
  reliabilityText: { fontSize: 13 },
  reliabilitySub: { fontSize: 12, color: '#64748B', marginTop: 5 },
  chartsWrapper: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  periodCard: {
    width: '48%',
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  relCard: {
    margin: 16,
    padding: 20,
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderTopWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  relHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  relBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  relBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ratioValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  relTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  relFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
  relDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  relDetailLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
  },
  relDetailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  relDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  relWarningBox: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 8,
    paddingHorizontal: 4,
  },
  relWarningText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  periodLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748B',
    fontWeight: '700',
  },
  periodDate: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 2,
  },
  recordBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recordBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
  },
  comparisonNote: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  gridLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipBalloon: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6A11CB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 8,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B', 
  },
  tooltipDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B', 
    fontWeight: '500',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  chartContainer: { 
    backgroundColor: '#FFF', 
    padding: 10, 
    borderRadius: 20, 
    elevation: 2,
    alignItems: 'center',
    shadowColor: '#6A11CB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  chartLabel: { fontSize: 12, color: '#64748B', alignSelf: 'flex-start', marginLeft: 10, marginBottom: 5 },
  chartStyle: { borderRadius: 16, paddingRight: 40 },
  analysisCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  badgeRow: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
  },
  verdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  verdictText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 15,
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricAbsolute: {
    fontSize: 14,
    fontWeight: '700',
  },
  percentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  labelWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12, 
  },
 
});

export default ComparisonScreen;