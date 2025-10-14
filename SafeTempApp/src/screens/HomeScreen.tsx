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
  Button
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataItem } from '../utils/types/DataItem';
import api from '../../services/api';
import stdb from '../../assets/stdashboard.png';
import styled from 'styled-components/native';
import TemperatureChart from '../components/dashboard/TemperatureChart';
import { getHistory6h, HistoryData } from '../../services/temperature';


const screenWidth = Dimensions.get('window').width;

const HomeScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [currentTemperature, setCurrentTemperature] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);


  const [history, setHistory] = useState<HistoryData[]>([]);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
<View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo source={stdb} />
        </View>

      </View>
      <View style={[styles.card, statusColor]}>
        <Text style={styles.cardTitle}>Temperatura Atual</Text>
        <Text style={styles.temperatureText}>
          {currentTemperature?.value}°C
        </Text>
<Text style={styles.status}>Status: {status}</Text>
      </View>
      <View style={styles.container}>
        <TemperatureChart data={history}></TemperatureChart>
      </View>
    </SafeAreaView>
  );
};


const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16, },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#4c669f', },
  };
  
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  logoutText: { fontSize: 16, color: '#4c669f', fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 15 },
  temperatureText: { fontSize: 48, fontWeight: 'bold', color: '#4c669f', textAlign: 'center' },
  statusText: { fontSize: 16, textAlign: 'center', marginTop: 10, color: '#888' },
  statusOk: { color: 'green', fontWeight: 'bold' },
  logoContainer: { marginTop: 20, marginBottom: 20 },
  safe: { borderColor: '#4CAF50', borderWidth: 3 },
  warning: { borderColor: '#FFC107', borderWidth: 3 },
  danger: { borderColor: '#F44336', borderWidth: 3 },
    temp: {
    fontSize: 56,
    fontWeight: '800',
    color: '#003B73',
  },
  status: {
    fontSize: 18,
    marginTop: 8,
    color: '#003B73',
  },
  update: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
});

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