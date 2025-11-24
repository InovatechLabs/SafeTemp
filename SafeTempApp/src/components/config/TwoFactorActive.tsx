import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
  Linking
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';


export default function TwoFactorActiveScreen() {
  const navigation = useNavigation<any>();
  
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean | null>(null);
  const [backupCode, setBackupCode] = useState("Carregando...");
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [disabling, setDisabling] = useState(false);

 useFocusEffect(
    useCallback(() => {
      const fetch2FAData = async () => {
        try {
          const response = await api.get('2fa/get-backup-code');

          setBackupCode(response.data.backupCode || "Indisponível");
          setIs2FAEnabled(!!response.data.is2FAEnabled);
        } catch (error) {
          setIs2FAEnabled(false);
          setBackupCode("-");
        } finally {
          setLoading(false);
        }
      };

      fetch2FAData();
    }, []) 
  );


  const handleDisableRequest = () => {
    setTokenInput("");
    setModalVisible(true);
  };

  const handleActivatePress = () => {
    Alert.alert("Configurar 2FA", "Redirecionando para configuração...");
    navigation.navigate('TwoFactorSetup')
  };

  const confirmDisable = async () => {
    if (tokenInput.length < 6) {
      Alert.alert("Erro", "O código deve ter 6 dígitos.");
      return;
    }
    setDisabling(true);
    try {
      await api.patch('2fa/disable-2fa', { token2FA: tokenInput });
      Alert.alert("Sucesso", "Autenticação de dois fatores desativada.");
      setIs2FAEnabled(false);
      setModalVisible(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao desativar.";
      Alert.alert("Erro", msg);
    } finally {
      setDisabling(false);
    }
  };


  if (loading) {
    return (
      <View style={[styles.container, { padding: 20 }]}>
        <ActivityIndicator size="small" color="#007BFF" />
      </View>
    );
  }

 return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Segurança</Text>
      </View>

      <View style={styles.content}>

        {/* Status Card */}
        <View style={[styles.statusCard, !is2FAEnabled && styles.statusCardDisabled]}>
          <MaterialIcons 
            name={is2FAEnabled ? "verified-user" : "gpp-bad"} 
            size={32} 
            color={is2FAEnabled ? "#4CAF50" : "#757575"} 
            style={styles.statusIcon} 
          />
          <View style={styles.statusTextContainer}>
             <Text style={styles.statusLabel}>
               Autenticação de 2 Fatores está 
               {is2FAEnabled ? (
                 <Text style={styles.activeText}> ATIVA</Text>
               ) : (
                 <Text style={styles.inactiveText}> DESATIVADA</Text>
               )}
             </Text>
          </View>
        </View>

        {is2FAEnabled ? (
          <View>
            <Text style={styles.sectionTitle}>Código de Recuperação (Backup)</Text>

            <View style={styles.readOnlyInputContainer}>
              <MaterialIcons name="lock-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={[styles.readOnlyInput, Platform.OS === 'ios' ? { fontFamily: 'Courier' } : { fontFamily: 'monospace' }]}
                value={backupCode}
                editable={false} 
                selectTextOnFocus={false} 
              />
            </View>

            <Text style={styles.helperText}>
              Guarde este código em local seguro.
            </Text>

            <TouchableOpacity style={styles.disableButton} onPress={handleDisableRequest} activeOpacity={0.8}>
                <Text style={styles.disableButtonText}>Desativar 2FA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activateContainer}>
            <Text style={styles.helperText}>
              Proteja sua conta adicionando uma camada extra de segurança.
            </Text>
            <TouchableOpacity style={styles.activateButton} onPress={handleActivatePress} activeOpacity={0.8}>
                <Text style={styles.activateButtonText}>Ativar 2FA</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
      
      {/* Modal de Confirmação */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Desativação</Text>
            <Text style={styles.modalSubTitle}>Digite o código de 6 dígitos do app autenticador:</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={tokenInput}
              onChangeText={setTokenInput}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => setModalVisible(false)}
                disabled={disabling}
              >
                <Text style={styles.modalBtnTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={confirmDisable}
                disabled={disabling}
              >
                {disabling ? (
                   <ActivityIndicator color="#fff" size="small" />
                ) : (
                   <Text style={styles.modalBtnTextConfirm}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
container: {
    width: '95%',         
    alignSelf: 'center', 
    backgroundColor: '#fff',
    borderRadius: 20,      
    marginBottom: 30,  
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,

    overflow: 'hidden', 
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff', 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  statusCardDisabled: {
    backgroundColor: '#f9f9f9',
    borderColor: '#eee',
  },
  statusIcon: {
    marginRight: 15,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#757575',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  readOnlyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F3F4',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 10,
  },
  readOnlyInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  // Botões
  disableButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disableButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  activateContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  activateButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#eee',
  },
  modalBtnConfirm: {
    backgroundColor: '#FF4444',
  },
  modalBtnTextCancel: {
    color: '#333',
    fontWeight: 'bold',
  },
  modalBtnTextConfirm: {
    color: '#fff',
    fontWeight: 'bold',
  },
});