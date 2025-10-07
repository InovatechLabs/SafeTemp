import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import api from '../../services/api';


interface DataItem {
  id: number;
  chipId: string;
  value: string;
  timestamp: string;
}

const HomeScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [currentTemperature, setCurrentTemperature] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLastTemperature = async () => {
      try {
        const response = await fetch(`https://safetemp-backend.onrender.com/api/data/lastdata`);
        
        if(!response.ok) {
          throw new Error("Erro ao listar ultimo dado");
        }
        const data = await response.json();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard da Estufa</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Temperatura Atual</Text>
        <Text style={styles.temperatureText}>
          {currentTemperature?.value}°C
        </Text>
        <Text style={styles.statusText}>
          Status:{' '}
          <Text style={styles.statusOk}>
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  logoutText: { fontSize: 16, color: '#4c669f', fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 15 },
  temperatureText: { fontSize: 48, fontWeight: 'bold', color: '#4c669f', textAlign: 'center' },
  statusText: { fontSize: 16, textAlign: 'center', marginTop: 10, color: '#888' },
  statusOk: { color: 'green', fontWeight: 'bold' },
});

const HomeScreenWrapper = ({ navigation }) => (
  <SafeAreaProvider>
    <HomeScreen navigation={navigation} />
  </SafeAreaProvider>
);

export default HomeScreenWrapper;
