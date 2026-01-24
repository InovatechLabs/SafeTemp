import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface GuestAccessModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const GuestAccessModal = ({ visible, onClose, onConfirm }: GuestAccessModalProps) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="account-eye-outline" size={32} color="#6A11CB" />
            </View>
            <Text style={styles.title}>Modo Visitante</Text>
            <Text style={styles.description}>
              Você terá rápido acesso aos dados para leitura, mas com algumas limitações de uso.
            </Text>
          </View>

          <View style={styles.comparisonTable}>
            <View style={styles.column}>
              <Text style={[styles.columnTitle, { color: '#000' }]}>O que você poderá fazer</Text>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.listText}>Ver temperatura em tempo real</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.listText}>Acessar histórico de dados</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.listText}>Consultar estatísticas</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.listText}>Ler & acessar histórico de relatórios</Text>
              </View>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.column}>
              <Text style={[styles.columnTitle, { color: '#FF4444' }]}>O que você não poderá fazer</Text>
              <View style={styles.listItem}>
                <Ionicons name="close-circle" size={16} color="#FF4444" />
                <Text style={styles.listText}>Criar novos experimentos</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="close-circle" size={16} color="#FF4444" />
                <Text style={styles.listText}>Configurar alertas personalizados</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="close-circle" size={16} color="#FF4444" />
                <Text style={styles.listText}>Ativar controle da estufa</Text>
              </View>
            </View>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Voltar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <LinearGradient
                colors={['#6A11CB', '#2575FC']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                <Text style={styles.confirmBtnText}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { backgroundColor: '#FFF', borderRadius: 28, padding: 26, width: '100%', maxWidth: 370, elevation: 10 },
  header: { alignItems: 'center', marginBottom: 25 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  description: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  comparisonTable: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 20 },
  column: { flex: 1, paddingHorizontal: 4 },
  columnTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' },
  verticalDivider: { width: 1, backgroundColor: '#E0E0E0', height: '100%', marginHorizontal: 5 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  listText: { fontSize: 11, color: '#444', marginLeft: 6, flexShrink: 1, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: '#E0E0E0' },
  cancelBtnText: { color: '#666', fontWeight: 'bold' },
  confirmBtn: { flex: 1.5, borderRadius: 14, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 0.5 }
});