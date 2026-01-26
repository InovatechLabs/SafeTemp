import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LabReportModal } from './LabReportModal';
import api from '../../../services/api';
import { Experimento } from '../../utils/types/experiments';

interface PublicExperimentsListProps {
  experiments: Experimento[];
  loading: boolean;
}

export const PublicExperimentsList = ({ experiments, loading }: PublicExperimentsListProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExp, setSelectedExp] = useState<Experimento | null>(null);

  if (loading) return <ActivityIndicator size="large" color="#ce6e46" style={{ marginTop: 20 }} />;

  return (
    <View style={styles.listContainer}>
      {experiments.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum experimento finalizado encontrado.</Text>
      ) : (
        experiments.map((item) => (
          <View key={item.id} style={styles.experimentCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.experimentTitle}>{item.nome}</Text>
              <Text style={styles.experimentDate}>
                {new Date(item.data_fim).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={styles.experimentObjective} numberOfLines={2}>
              {item.objetivo || "Objetivo não informado."}
            </Text>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataText}>👤 {item.responsavel?.name}</Text>
              <Text style={styles.metadataText}>🌡️ {item.temp_min_ideal}°C - {item.temp_max_ideal}°C</Text>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setSelectedExp(item);
                setModalVisible(true);
              }}
            >
              <Text style={styles.actionButtonText}>LER LAUDO TÉCNICO</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <LabReportModal 
        visible={modalVisible}
        report={selectedExp?.relatorio}
        experimentName={selectedExp?.nome}
        experimentId={selectedExp?.id}
        experimentStartDate={selectedExp?.data_inicio}
        experimentEndDate={selectedExp?.data_fim}

        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: { width: '100%', paddingBottom: 20 },
  experimentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' },
  experimentTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  experimentDate: { fontSize: 12, color: '#999' },
  experimentObjective: { fontSize: 14, color: '#666', marginVertical: 8 },
  metadataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metadataText: { fontSize: 12, color: '#888' },
  actionButton: {
    backgroundColor: '#ce6e46', 
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 30 },
});