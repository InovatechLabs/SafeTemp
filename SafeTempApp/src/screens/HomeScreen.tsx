import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const chartData = {
  labels: ['-6h', '-5h', '-4h', '-3h', '-2h', '-1h'],
  datasets: [
    {
      data: [22, 22.5, 23, 24, 23.5, 24.5],
      color: (opacity = 1) => `rgba(76, 102, 159, ${opacity})`,
      strokeWidth: 2,
    },
  ],
  legend: ['Temperatura (°C)'],
};

// CORREÇÃO APLICADA AQUI
const HomeScreen = ({ navigation }) => {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard da Estufa</Text>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Temperatura Atual</Text>
          <Text style={styles.temperatureText}>24.5°C</Text>
          <Text style={styles.statusText}>Status: <Text style={styles.statusOk}>Normal</Text></Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico (Últimas 6 Horas)</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alertas Recentes</Text>
          <View style={styles.alertItem}>
            <Text style={styles.alertText}>- Nível de umidade baixo às 14:30</Text>
          </View>
          <View style={styles.alertItem}>
            <Text style={styles.alertText}>- Temperatura máxima atingida ontem</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>Ver todos os alertas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ...const chartConfig e const styles continuam os mesmos...
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
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    scrollContainer: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
    logoutText: { fontSize: 16, color: '#4c669f', fontWeight: 'bold' },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 15 },
    temperatureText: { fontSize: 48, fontWeight: 'bold', color: '#4c669f', textAlign: 'center' },
    statusText: { fontSize: 16, textAlign: 'center', marginTop: 10, color: '#888' },
    statusOk: { color: 'green', fontWeight: 'bold' },
    chart: { marginVertical: 8, borderRadius: 16 },
    alertItem: { marginBottom: 10 },
    alertText: { fontSize: 15, color: '#333' },
    viewAllText: { marginTop: 10, color: '#4c669f', fontWeight: 'bold', textAlign: 'right' },
  });

const HomeScreenWrapper = ({ navigation }) => (
  <SafeAreaProvider>
    <HomeScreen navigation={navigation} />
  </SafeAreaProvider>
);

export default HomeScreenWrapper;