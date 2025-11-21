import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReportUIModel, ReportStats } from '../../utils/types/reports';
import api from '../../../services/api';

interface ReportsListProps {
  onPressReport: (report: ReportUIModel) => void; 
}

export default function ReportsList({ onPressReport }: ReportsListProps) {

  const [reports, setReports] = useState<ReportUIModel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {

    try {
       const response = await api.get('reports/list');
       const apiData = await response.data;

       const formattedData: ReportUIModel[] = apiData.map((item: any) => {
        let parsedStats: ReportStats = {};
        try {
            parsedStats = JSON.parse(item.resumo);
        } catch (e) {
          console.error("Erro ao parsear resumo", e);
        }
        const dateObj = new Date(item.data);
        const timeFormatted = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const avgTemp = parsedStats.media ? parsedStats.media.toFixed(1) : '?';

        return {
          id: item.id.toString(),
          title: `Relatório ${item.id}`,
          time: timeFormatted,
          summaryText: `Temp. Média ${avgTemp}°C`,

          fullData: {
            text: item.relatorio,
            stats: parsedStats,
            meta: {
              chipId: item.chip_id,
              date: item.data,
              criado_em: item.criado_em
            }
          }
        }
       });
       setReports(formattedData);
    } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchReports();
  }, []);
  const renderItem = ({ item }: { item: ReportUIModel }) => {

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => onPressReport(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#4A148C' }]}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color="#FFF" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.reportText} numberOfLines={1}>
            <Text style={styles.boldText}>{item.title}</Text> - {item.time} - {item.summaryText}
          </Text>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={20} color="#8d8d8d" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#4A148C" style={{ marginVertical: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum relatório encontrado hoje.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
    marginLeft: 5,
  },
  listContent: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EBF5',
    borderRadius: 16,
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  reportText: {
    fontSize: 14,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10
  }
});