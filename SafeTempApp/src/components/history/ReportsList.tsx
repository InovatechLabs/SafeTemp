import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReportUIModel, ReportStats } from '../../utils/types/reports';

const MAX_LIST_HEIGHT = 380;

interface ReportsListProps {
  onPressReport: (report: ReportUIModel) => void; 
  data: ReportUIModel[]; 
  loading?: boolean;
}

export default function ReportsList({ onPressReport, data, loading }: ReportsListProps) {

  const isScrollable = data.length > 5;

  const renderReportItem = (item: ReportUIModel) => (
    <TouchableOpacity 
      key={item.id} 
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

  if (loading) {
    return <ActivityIndicator size="small" color="#4A148C" style={{ marginVertical: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={[
        styles.listWrapper, 
        isScrollable && { height: MAX_LIST_HEIGHT }
      ]}>
        
        <ScrollView
          nestedScrollEnabled={true} 
          scrollEnabled={isScrollable} 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
        >
          {data.length > 0 ? (
            data.map(item => renderReportItem(item))
          ) : (
            <Text style={styles.emptyText}>Nenhum relatório encontrado hoje.</Text>
          )}
        </ScrollView>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 10,
  },

  listWrapper: {
    width: '100%',
   borderRadius: 16,
    overflow: 'hidden', 
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
    paddingBottom: 10, 
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