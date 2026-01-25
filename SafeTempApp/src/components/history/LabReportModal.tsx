import React from 'react';
import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import stlogo from '../../../assets/logost.png';
import styled from 'styled-components/native';
import { formatUTCtoBRT } from '../../utils/formatters/isoDate';

const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 100px;
  height: 50px;
  margin-bottom: 6;
`;

const { height } = Dimensions.get('window');

export const LabReportModal = ({
    visible, 
    report, 
    onClose, 
    experimentName, 
    experimentId, 
    experimentStartDate, 
    experimentEndDate
}: any) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
        <View style={styles.sheet}>
               <View style={styles.headerActions}>
            <Text style={styles.modalTitle}>Visualizar Relatório</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

                      <View style={styles.docHeader}>
                        <View style={styles.brandRow}>
                          <Logo source={stlogo} />
                          <Text style={styles.docType}>Relatório de Experimento</Text>
                        </View>
                        
                        <View style={styles.metaDataContainer}>
                          <Text style={styles.metaText}><Text style={styles.bold}>ID Relatório:</Text> {experimentId}</Text>
                          <Text style={styles.metaText}><Text style={styles.bold}>Data Início:</Text> {formatUTCtoBRT(experimentStartDate)}</Text>
                          <Text style={styles.metaText}><Text style={styles.bold}>Data Fim:</Text> {formatUTCtoBRT(experimentEndDate)} </Text>
                        </View>
                      </View>
          
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.experimentTitle}>{experimentName}</Text>
            <View style={styles.divider} />
            <View style={styles.detailedContainer}>
                <Text style={styles.bodyText}>{report || "Aguardando geração de laudo..."}</Text>
            </View>
          </ScrollView>
        </View>    
      </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#FFF', borderRadius: 15, height: '90%', overflow: 'hidden' },
  header: { padding: 15, borderBottomWidth: 1, borderColor: '#EEE', flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#6A11CB', textTransform: 'uppercase' },
  content: { padding: 20 },
  experimentTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  divider: { height: 2, backgroundColor: '#6A11CB', width: 40, marginBottom: 20 },
  bodyText: { fontSize: 15, lineHeight: 24, color: '#444', textAlign: 'justify' },
  footerBtn: { backgroundColor: '#6A11CB', padding: 18, alignItems: 'center' },
  footerBtnText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 },
   docHeader: { marginBottom: 15, padding: 10 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  brandTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  docType: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaDataContainer: { gap: 8 },
  metaText: { fontSize: 13, color: '#555' },
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
  bold: { fontWeight: 'bold' },
   modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    height: height * 0.90,
  },
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
});