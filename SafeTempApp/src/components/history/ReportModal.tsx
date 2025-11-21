import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import stlogo from '../../../assets/logost.png';
import styled from 'styled-components/native';
import { ReportUIModel, ReportStats } from '../../utils/types/reports';
import { 
 File,
 Directory,
 Paths
} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from '../../../services/api';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportData: ReportUIModel | null; 
}

const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 100px;
  height: 50px;
  margin-bottom: 6;
`;

const { height } = Dimensions.get('window');

export default function ReportModal({ visible, onClose, reportData }: ReportModalProps) {

    const [downloading, setDownloading] = useState(false);

    if (!reportData) return null;

    const { fullData, title, id } = reportData;
    const { stats, meta, text } = fullData;

    const generationDate = new Date(meta.criado_em); 
    const formattedDate = generationDate.toLocaleString('pt-BR', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });

    const renderStyledText = (rawText: string) => {
    if (!rawText) return <Text style={styles.paragraph}>Sem análise.</Text>;

    const cleanText = rawText.replace(/\\n/g, '\n');

    // 2. Divide o texto em linhas
    const lines = cleanText.split('\n');

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine.length === 0) {
        return <View key={index} style={{ height: 10 }} />;
      }

      // 3. Detecta listas (Começa com * ou -)
      if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
        const content = trimmedLine.replace(/^[\*\-]\s*/, '');
        return (
          <View key={index} style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>{content}</Text>
          </View>
        );
      }

      return (
        <Text key={index} style={styles.paragraph}>
          {line}
        </Text>
      );
    });
  };

      const handlePDFDownload = async (id: string) => {
        setDownloading(true)

        const pdfUrl = `${api.defaults.baseURL}reports/reportpdf/${id}`;
        const destination = new Directory(Paths.cache, 'pdfs')
        try {

            if (!destination.exists) {
                destination.create();
            }
            
            const destinationFile = new File(destination, `relatorio_${id}.pdf`);
            if (destinationFile.exists) {
            destinationFile.delete(); 
            }
            const output = await File.downloadFileAsync(pdfUrl, destinationFile);

            if (output) {
                if (!(await Sharing.isAvailableAsync())) {
                    Alert.alert("Erro", "Compartilhamento indisponível.");
                    return;
                }

                await Sharing.shareAsync(output.uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Baixar Relatório ${id}`
                });
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível baixar o PDF.");
        } finally {
            setDownloading(false);
        }
    };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
 
          <View style={styles.headerActions}>
            <Text style={styles.modalTitle}>Visualizar Relatório</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>


    
            <View style={styles.docHeader}>
              <View style={styles.brandRow}>
                <Logo source={stlogo} />
                <Text style={styles.docType}>Relatório de Temperatura</Text>
              </View>
              
              <View style={styles.metaDataContainer}>
                <Text style={styles.metaText}><Text style={styles.bold}>ID Relatório:</Text> {id}</Text>
                <Text style={styles.metaText}><Text style={styles.bold}>Gerado em:</Text> {formattedDate}</Text>
                <Text style={styles.metaText}><Text style={styles.bold}>Chip ID:</Text> {meta.chipId}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Resumo Estatístico</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#EFE6FD' }]}>
                <Text style={styles.statLabel}>Média Geral</Text>
                <Text style={[styles.statValue, { color: '#4A148C' }]}>
                  {stats.media ? stats.media.toFixed(2) : '--'}°C
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.statLabel}>Mínima Abs.</Text>
                <Text style={[styles.statValue, { color: '#1565C0' }]}>
                  {stats.min ? stats.min.toFixed(2) : '--'}°C
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
                <Text style={styles.statLabel}>Máxima Abs.</Text>
                <Text style={[styles.statValue, { color: '#C62828' }]}>
                  {stats.max ? stats.max.toFixed(2) : '--'}°C
                </Text>
              </View>
            </View>

            <View style={styles.detailedContainer}> 
              <Text style={styles.subSectionTitle}>Análise Detalhada</Text>
              
<ScrollView 
                style={styles.innerScroll} 
                nestedScrollEnabled={true} 
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.textContent}>
                  {renderStyledText(text)}
                </View>
              </ScrollView>

              <View style={styles.statsList}>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>• Desvio Padrão:</Text>
                  <Text style={styles.statRowValue}>{stats.std ? stats.std.toFixed(2) : 'N/A'} %</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>• Variância:</Text>
                  <Text style={styles.statRowValue}>{stats.variancia ? stats.variancia.toFixed(2) : 'N/A'} %</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>• Outliers:</Text>
                  <Text style={styles.statRowValue}>{stats.totalOutliers ?? 'N/A'} detectados</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <Text style={styles.sectionTitle}>Ações</Text>
              <View style={styles.actionButtonsRow}>
<TouchableOpacity 
  style={styles.actionBtn} 
  activeOpacity={0.7} 
  onPress={() => handlePDFDownload(id)} // Chama a função passando o ID
  disabled={downloading} // Evita clique duplo
>
  <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
    {downloading ? (
      // Mostra loading girando se estiver baixando
      <ActivityIndicator size="small" color="#C62828" />
    ) : (
      // Mostra ícone normal se estiver parado
      <MaterialCommunityIcons name="file-pdf-box" size={24} color="#C62828" />
    )}
  </View>
  <Text style={styles.actionLabel}>
    {downloading ? 'Baixando...' : 'Baixar PDF'}
  </Text>
</TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                    <MaterialCommunityIcons name="share-variant" size={24} color="#1565C0" />
                  </View>
                  <Text style={styles.actionLabel}>Compartilhar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                    <MaterialCommunityIcons name="file-delimited" size={24} color="#2E7D32" />
                  </View>
                  <Text style={styles.actionLabel}>Exportar CSV</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>SafeTemp - Sistema de Monitoramento</Text>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    height: height * 0.90,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 50,
  },
  docHeader: { marginBottom: 15 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  brandTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  docType: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaDataContainer: { gap: 4 },
  metaText: { fontSize: 13, color: '#555' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 20 },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#4A148C', paddingLeft: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '31%', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 11, color: '#555', marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 15, fontWeight: 'bold' },

  detailedSection: { backgroundColor: '#FAFAFA', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
  subSectionTitle: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 10 },
  paragraph: { fontSize: 13, color: '#444', lineHeight: 20, marginBottom: 15, textAlign: 'justify' },
  
  statsList: { gap: 8, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 4 },
  statRowLabel: { fontSize: 13, color: '#555' },
  statRowValue: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  
  bold: { fontWeight: 'bold' },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#999', fontStyle: 'italic' },

  actionsContainer: { marginTop: 25, marginBottom: 10 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  actionBtn: { alignItems: 'center', width: '30%' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  actionLabel: { fontSize: 12, color: '#555', textAlign: 'center', fontWeight: '500' },

  detailedContainer: { 
    backgroundColor: '#FAFAFA', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#EEE',
    padding: 15,
  },
  innerScroll: {
    maxHeight: 400, 
    marginBottom: 15,
  },
  textContent: {
    paddingRight: 10, 
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 10, 
  },
  bulletPoint: {
    fontSize: 16,
    color: '#4A148C',
    marginRight: 6,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
});