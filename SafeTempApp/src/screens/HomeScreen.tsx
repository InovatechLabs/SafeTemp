
import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Button,
  Alert,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataItem } from '../utils/types/DataItem';
import api from '../../services/api';
import stdb from '../../assets/stdashboard.png';
import styled from 'styled-components/native';
import TemperatureChart from '../components/dashboard/TemperatureChart';
import { getHistory6h } from '../../services/temperature';
import * as SecureStore from 'expo-secure-store';
import { styles } from './styles/styles';
import { ButtonTouchable } from './LoginScreen';
import { Statistics } from '../utils/types/Statistics';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Details: { id: number } | undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const screenWidth = Dimensions.get('window').width;

const HomeScreen = ({ navigation }: Props) => {

  const { signOut } = useAuth();

  const [currentTemperature, setCurrentTemperature] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // States do formulario de criaçao de alerta
  const [temperaturaMin, setTemperaturaMin] = useState("");
  const [temperaturaMax, setTemperaturaMax] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [nome, setNome] = useState("");
  const [nota, setNota] = useState("");
  const [checked, setChecked] = useState(true);

  const [history, setHistory] = useState<DataItem[]>([]);
  const [pieData, setPieData] = useState<Statistics | null>(null);

  useEffect(() => {
    const loadLastTemperature = async () => {
      try {
        const response = await api.get('data/lastdata');
        const data = response.data;

        setCurrentTemperature(data.lastRecord);

      } catch (error) {
        console.error("Erro ao buscar temperatura:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLastTemperature();
  }, []);

  useEffect(() => {
    async function fetchTemperatureData() {
      try {
        const response = await api.get('data/history1h');
        const json = response.data;
        setPieData(json);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }

    fetchTemperatureData();
  }, []);

   useEffect(() => {
        const loadHistory = async () => {
          try {
            const data = await getHistory6h();
          console.log('Dados recebidos:', data)
            setHistory(data);
    
    
          } catch (error) {
            console.error('Falha ao resgatar historico: ', error);
          }
        };
        
        loadHistory();
      }, []);
  
      const handleSaveAlert = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      console.log(token);
      if (!token) {
        Alert.alert("Erro", "Usuário não autenticado");
        return;
      }

const today = new Date().toISOString().split("T")[0]; // "2025-11-03"
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

      console.log('Response status:', response.status);
const text = await response.text();
console.log('Raw response:', text);
      if (response.ok) {
        Alert.alert("Sucesso", "Alerta configurado com sucesso!");
        setModalVisible(false);
      } 
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar o alerta");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  let status = 'Normal';
  let statusColor = styles.safe;

  let temp = parseInt(currentTemperature ? currentTemperature.value : '0')

  if (temp > 35) {
    status = 'Perigo';
    statusColor = styles.danger;
  } else if (temp > 30) {
    status = 'Alerta';
    statusColor = styles.warning;
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
<View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo source={stdb} />
        </View>

      </View>
      <TouchableOpacity onPress={signOut}>
        <Text>Logout</Text>
      </TouchableOpacity>
      <View style={[styles.card, statusColor]}>
        <Text style={styles.cardTitle}>Temperatura Atual</Text>
        <Text style={styles.temperatureText}>
          {currentTemperature?.value}°C
        </Text>
<Text style={styles.status}>Status: {status}</Text>
  <TouchableOpacity
        style={styles.configButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.configButtonText}>⚙️ Configurar alerta</Text>
      </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>📈  Histórico Recente</Text>
        {/* @ts-ignore */}
        <TemperatureChart data={history}></TemperatureChart>
 <Modal visible={modalVisible} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>

      <Text style={styles.modalTitle}>Configurar Alerta</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome do Alerta (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Experimento com Fungos"
          placeholderTextColor={'#a3a3a3'}
          value={nome}
          onChangeText={setNome}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nota (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Desativar após as 13:00h"
          placeholderTextColor={'#a3a3a3'}
          value={nota}
          onChangeText={setNota}
        />
      </View>

      <Text style={styles.sectionTitle}>Temperaturas</Text>
      
      <View style={styles.rowContainer}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Mínima (°C)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 10"
            placeholderTextColor={'#a3a3a3'}
            keyboardType="numeric"
            value={temperaturaMin}
            onChangeText={setTemperaturaMin}
          />
        </View>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Máxima (°C)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 35"
            placeholderTextColor={'#a3a3a3'}
            keyboardType="numeric"
            value={temperaturaMax}
            onChangeText={setTemperaturaMax}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Período de monitoramento</Text>

      <View style={styles.switchContainer}>
        <Switch
          trackColor={{ false: '#ccc', true: '#4CAF50' }}
          thumbColor={checked ? '#fff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={setChecked}
          value={checked}
        />
        <Text style={styles.switchLabel}>
            {checked ? "Monitorar 24h" : "Definir horário específico"}
        </Text>
      </View>

      {!checked && (
        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Hora início</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 09:00"
              placeholderTextColor={'#a3a3a3'}
              value={horaInicio}
              onChangeText={setHoraInicio}
            />
          </View>

          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Hora fim</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 17:00"
              placeholderTextColor={'#a3a3a3'}
              value={horaFim}
              onChangeText={setHoraFim}
            />
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
  </View>
</Modal>
      </View>
    </SafeAreaView>
  );
};
  


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
    <HomeScreen navigation={navigation} />
  </SafeAreaProvider>
);

export default HomeScreenWrapper;