import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataItem, DataItemArray } from '../utils/types/DataItem';
import api from '../../services/api';
import styled from 'styled-components/native';
import TemperatureChart from '../components/dashboard/TemperatureChart';
import { getHistory6h } from '../../services/temperature';
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import stdb from '../../assets/stdashboard.png';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined; 
};

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { signOut } = useAuth(); 

  const [currentTemperature, setCurrentTemperature] = useState<DataItem | null>(null);
  const [history, setHistory] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ min: '--', max: '--' });

  const [modalVisible, setModalVisible] = useState(false);
  const [temperaturaMin, setTemperaturaMin] = useState("");
  const [temperaturaMax, setTemperaturaMax] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [nome, setNome] = useState("");
  const [nota, setNota] = useState("");
  const [checked, setChecked] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [lastDataResponse, history1hResponse, history6hData] = await Promise.all([
        api.get('data/lastdata'),
        api.get('data/history1h'),
        getHistory6h()
      ]);

      setCurrentTemperature(lastDataResponse.data.lastRecord);
      
      const dataResponse = history6hData as unknown as DataItemArray;

      if (dataResponse && dataResponse.records) {
        setHistory(dataResponse.records)
      } else {
        if (Array.isArray(history6hData)) {
          setHistory([]);
        }
      }

      if (history1hResponse.data.statistics) {
          setStats({
              min: history1hResponse.data.statistics.min,
              max: history1hResponse.data.statistics.max
          })
      }

    } catch (error) {
      console.error("Erro ao atualizar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const handleSaveAlert = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Erro", "Usuário não autenticado");
        return;
      }

      const today = new Date().toISOString().split("T")[0]; 
      const horaInicioISO = horaInicio ? `${today}T${horaInicio}:00` : null;
      const horaFimISO = horaFim ? `${today}T${horaFim}:00` : null;

      const response = await fetch(`${api.defaults.baseURL}alerts/register-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          temperatura_min: parseFloat(temperaturaMin),
          temperatura_max: parseFloat(temperaturaMax),
          hora_inicio: horaInicioISO,
          hora_fim: horaFimISO,
          nome: nome || null,
          nota: nota || null
        }),
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Alerta configurado com sucesso!");
        setModalVisible(false);
        setTemperaturaMin(""); setTemperaturaMax(""); setHoraInicio(""); setHoraFim(""); setNome(""); setNota(""); setChecked(true);
      } else {
         Alert.alert("Erro", "Falha ao salvar alerta. Verifique os dados.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar o alerta");
    }
  };

  const handleLogout = () => {
    signOut();
  };

  let statusText = 'Normal';
  let statusColorBg = '#4CAF50'; 

  if (currentTemperature) {
      let temp = parseFloat(currentTemperature.value);
      if (temp > 35) {
          statusText = 'Perigo';
          statusColorBg = '#FF4444'; 
      } else if (temp > 30) {
          statusText = 'Alerta';
          statusColorBg = '#FFC107'; 
      }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F9" />
    
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo source={stdb} />
        </View> 
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboardData} />}
        showsVerticalScrollIndicator={false}
      >

        <LinearGradient
          colors={['#2A2D5D', '#4B2A59']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.statusBadge}>
               <View style={[styles.statusDot, { backgroundColor: statusColorBg }]} />
               <Text style={styles.statusText}>{statusText}</Text>
            </View>
            <MaterialCommunityIcons name="thermometer" size={24} color="#FFF" style={{ opacity: 0.8 }} />
          </View>

          <View style={styles.tempContainer}>
            {loading && !currentTemperature ? (
                <ActivityIndicator color="#FFF" size="large" />
            ) : (
                <Text style={styles.tempValue}>
                {currentTemperature ? parseFloat(currentTemperature.value).toFixed(1) : '--'}
                <Text style={styles.tempUnit}>°C</Text>
                </Text>
            )}
            <Text style={styles.tempLabel}>Temperatura Atual</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Mínima (1h)</Text>
                <Text style={styles.statValue}>{stats.min}°</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Máxima (1h)</Text>
                <Text style={styles.statValue}>{stats.max}°</Text>
            </View>
          </View>
        </LinearGradient>

        <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setModalVisible(true)}
        >
            <Ionicons name="settings-outline" size={20} color="#333" />
            <Text style={styles.actionButtonText}>Configurar Alertas</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Histórico Recente</Text>
             <Text style={styles.sectionSubtitle}>Últimas horas</Text>
          </View>
          
          <View style={styles.chartCard}>
             {history.length > 0 ? (
                // @ts-ignore
                <TemperatureChart data={history} />
             ) : (
                <Text style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                    {loading ? 'Carregando gráfico...' : 'Sem dados recentes.'}
                </Text>
             )}
          </View>
        </View>

      </ScrollView>

      {/* --- MODAL DE CONFIGURAÇÃO (Mantido Original) --- */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurar Alerta</Text>
            
            {/* ... Campos do Formulário (Idênticos ao original) ... */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Alerta (Opcional)</Text>
              <TextInput style={styles.input} placeholder="Ex: Experimento com Fungos" placeholderTextColor={'#a3a3a3'} value={nome} onChangeText={setNome} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nota (Opcional)</Text>
              <TextInput style={styles.input} placeholder="Ex: Desativar após as 13:00h" placeholderTextColor={'#a3a3a3'} value={nota} onChangeText={setNota} />
            </View>

            <Text style={styles.sectionTitleModal}>Temperaturas</Text>
            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Mínima (°C)</Text>
                <TextInput style={styles.input} placeholder="Ex: 10" placeholderTextColor={'#a3a3a3'} keyboardType="numeric" value={temperaturaMin} onChangeText={setTemperaturaMin} />
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Máxima (°C)</Text>
                <TextInput style={styles.input} placeholder="Ex: 35" placeholderTextColor={'#a3a3a3'} keyboardType="numeric" value={temperaturaMax} onChangeText={setTemperaturaMax} />
              </View>
            </View>

            <Text style={styles.sectionTitleModal}>Período de monitoramento</Text>
            <View style={styles.switchContainer}>
              <Switch trackColor={{ false: '#ccc', true: '#4CAF50' }} thumbColor={checked ? '#fff' : '#f4f3f4'} ios_backgroundColor="#3e3e3e" onValueChange={setChecked} value={checked} />
              <Text style={styles.switchLabel}>{checked ? "Monitorar 24h" : "Definir horário específico"}</Text>
            </View>

            {!checked && (
              <View style={styles.rowContainer}>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.label}>Hora início</Text>
                  <TextInput style={styles.input} placeholder="Ex: 09:00" placeholderTextColor={'#a3a3a3'} value={horaInicio} onChangeText={setHoraInicio} />
                </View>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.label}>Hora fim</Text>
                  <TextInput style={styles.input} placeholder="Ex: 17:00" placeholderTextColor={'#a3a3a3'} value={horaFim} onChangeText={setHoraFim} />
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveAlert} style={styles.saveButton}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>

          </View>
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// --- ESTILOS (Novo Design + Estilos do Modal Original) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  // --- HERO CARD ---
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#4B2A59',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tempContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  tempValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tempUnit: {
    fontSize: 24,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.7)',
  },
  tempLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  logoContainer: { marginTop: 20, marginBottom: 20 },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // --- ACTION BUTTON ---
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  // --- CHART SECTION ---
  chartSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // --- ESTILOS DO MODAL (Originais do seu arquivo styles.ts) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScrollView: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitleModal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 20,
  },
  halfInputContainer: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
  },
  switchLabel: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#ce6e46', // Usando a cor da sua identidade
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 330px;
  height: 100px;
`;

type WrapperProps = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreenWrapper = ({ navigation }: WrapperProps) => (
  <SafeAreaProvider>
    <HomeScreen />
  </SafeAreaProvider>
);

export default HomeScreenWrapper;