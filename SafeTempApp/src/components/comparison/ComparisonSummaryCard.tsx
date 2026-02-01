import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComparisonResponse } from '../../utils/types/comparison';

type SummaryType = ComparisonResponse['summary'];

const ComparisonSummaryCard = ({ summary }: { summary?: SummaryType }) => {
  if (!summary) return null;

  const getConfidenceStyles = (level: "alta" | "média" | "baixa") => {
  switch (level) {
    case 'alta':
      return {
        color: '#166534',
        bgColor: '#F0FDF4',
        icon: 'shield-check' as const,
        label: 'Confiança Alta'
      };
    case 'média':
      return {
        color: '#854D0E',
        bgColor: '#FEFCE8',
        icon: 'shield-alert' as const,
        label: 'Confiança Média'
      };
    case 'baixa':
      return {
        color: '#991B1B',
        bgColor: '#FEF2F2',
        icon: 'shield-off' as const,
        label: 'Confiança Baixa'
      };
    default:
      return { color: '#475569', bgColor: '#F1F5F9', icon: 'shield-outline' as const, label: 'Confiança' };
  }
};

const config = getConfidenceStyles(summary.confidence);

  return (
  <View style={[styles.container, { borderLeftColor: config.color }]}>

       <Text style={styles.title}>Sumário</Text>     
      <View style={styles.headerRow}>
    
        <View style={[styles.confidenceBadge, { backgroundColor: config.bgColor }]}>
          <MaterialCommunityIcons name={config.icon} size={14} color={config.color} />
          <Text style={[styles.confidenceText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
                <View style={styles.tagContainer}>
          {summary.tags.map((tag, index) => (
            <Text key={index} style={styles.tagText}>#{tag}</Text>
          ))}
        </View>
      </View>
      <Text style={styles.headline}>{summary.headline}</Text>

      <View style={styles.highlightsList}>
        {summary.highlights.map((highlight, index) => (
          <View key={index} style={styles.highlightItem}>
            <View style={styles.bullet} />
            <Text style={styles.highlightText}>{highlight}</Text>
          </View>
        ))}
      </View>

      <View style={styles.aiFooter}>
        <MaterialCommunityIcons name="auto-fix" size={18} color="#6A11CB" />
        <Text style={styles.aiNote}>Análise gerada pelo sistema SafeTemp</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderLeftWidth: 6,
    borderLeftColor: '#4ADE80', 
    shadowColor: '#6A11CB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
    gap: 8,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
  },
  headerContainer: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center'
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 16,
  },
  headline: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 16,
  },
  highlightsList: {
    gap: 10,
    marginBottom: 18,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6A11CB',
  },
  highlightText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  aiNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6A11CB',
    opacity: 0.8,
  },
});

export default ComparisonSummaryCard;