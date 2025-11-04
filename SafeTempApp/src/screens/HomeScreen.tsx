
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
import { LineChart } from 'react-native-chart-kit';
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

const screenWidth = Dimensions.get('window').width;

const HomeScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [currentTemperature, setCurrentTemperature] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [temperaturaMin, setTemperaturaMin] = useState("");
  const [temperaturaMax, setTemperaturaMax] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [checked, setChecked] = useState(true);

  const [history, setHistory] = useState<DataItem[]>([]);

  useEffect(() => {
    const loadLastTemperature = async () => {
      try {
        const response = await api.get('data/lastdata');
        const data = response.data;
  
        console.log("Dado recebido do backend:", data);
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
        console.log("nao tem token")
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
        }),
      });

      console.log('Response status:', response.status);
const text = await response.text();
console.log('Raw response:', text);
      if (response.ok) {
        Alert.alert("Sucesso", "Alerta configurado com sucesso!");
        setModalVisible(false);
      } else {
      //  const errorData = await response.json();
       // Alert.alert("Erro", errorData.message || "Falha ao salvar alerta");
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

  let temp = parseInt(currentTemperature?.value)

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
        <TemperatureChart data={history}></TemperatureChart>
        <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurar Alerta</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Temperatura mínima</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 10"
          keyboardType="numeric"
          value={temperaturaMin}
          onChangeText={setTemperaturaMin}
        />
      </View>
  <View style={styles.inputGroup}>
        <Text style={styles.label}>Temperatura máxima</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 35"
          keyboardType="numeric"
          value={temperaturaMax}
          onChangeText={setTemperaturaMax}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.cardTitle}>Período de monitoramento</Text>
      </View>
       <View style={styles.checkboxContainer}>
     <Switch
        trackColor={{ false: '#ccc', true: '#4CAF50' }}
        thumbColor={checked ? '#fff' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={setChecked}
        value={checked}
      />
      <Text style={styles.label}>Sempre</Text>
    </View>
<View style={styles.inputGroup}>

      {!checked && (
        <>
        <Text style={styles.cardTitle}>Customizar intervalo de horário</Text>
        <Text style={styles.label}>Hora início</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 09:00"
          value={horaInicio}
          onChangeText={setHoraInicio}
        />
           <View style={styles.inputGroup}>
        <Text style={styles.label}>Hora fim</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 17:00"
          value={horaFim}
          onChangeText={setHoraFim}
        />
      </View>
       
        </>
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
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
};
  


const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 330px;
  height: 100px;
`;

const HomeScreenWrapper = ({ navigation }) => (
  <SafeAreaProvider>
    <HomeScreen navigation={navigation} />
  </SafeAreaProvider>
);

export default HomeScreenWrapper;