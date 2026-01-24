import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRoute, useNavigation, StackActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import api from '../../services/api';
import { StackNavigationProp } from '@react-navigation/stack';

const screenWidth = Dimensions.get("window").width;

const ExperimentDetailScreen = () => {
  const route = useRoute();

  type RootStackParamList = {
  Home: undefined;
  ExperimentDetail: { experimento: any, history: any, currentTemp: any };
};
const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const { experimento, history, currentTemp } = route.params as any;

  const safeNumber = (val: any) => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

const handleFinalize = async () => {
  Alert.alert(
    "Finalizar Experimento",
    "Deseja realmente encerrar a coleta de dados deste experimento?",
    [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Sim, Finalizar", 
        style: "destructive",
        onPress: async () => {
          try {
            await api.patch(`experiments/end/${experimento.id}`);
            Alert.alert("Sucesso", "Experimento finalizado com sucesso!");
            navigation.dispatch(StackActions.popToTop());
          } catch (error) {
            Alert.alert("Erro", "Não foi possível finalizar o experimento.");
          }
        }
      }
    ]
  );
};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header com Gradiente Técnico */}
      <LinearGradient colors={['#2A2D5D', '#4B2A59']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Experimento</Text>
        <View style={{ width: 24 }} /> 
      </LinearGradient>

      <View style={styles.content}>
        {/* Card de Identificação */}
        <View style={styles.infoCard}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="beaker-check" size={28} color="#6A11CB" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.expName}>{experimento.nome}</Text>
              <Text style={styles.expOwner}>Responsável: {experimento.responsavel.name}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Objetivo do Experimento</Text>
          <Text style={styles.objetivoText}>{experimento.objetivo || "Sem objetivo descrito."}</Text>
        </View>

        {/* Grid de Parâmetros */}
        <View style={styles.paramsGrid}>
          <View style={styles.paramBox}>
            <Text style={styles.paramLabel}>Mínimo Ideal</Text>
            <Text style={[styles.paramValue, { color: '#2575FC' }]}>{experimento.temp_min_ideal}°C</Text>
          </View>
          <View style={styles.paramBox}>
            <Text style={styles.paramLabel}>Máximo Ideal</Text>
            <Text style={[styles.paramValue, { color: '#FF4B2B' }]}>{experimento.temp_max_ideal}°C</Text>
          </View>
        </View>

        {/* Gráfico Analítico com Linhas de Limite */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Curva Térmica vs Limites</Text>
<LineChart
  data={{
    labels: [], 
                          datasets: [
                              {

                                  data: history && history.length > 0
                                      ? history.map((h: any) => safeNumber(h.value))
                                      : [0],
                                  color: (opacity = 1) => `rgba(106, 17, 203, ${opacity})`,
                                  strokeWidth: 3
                              },
                              {

                                  data: history && history.length > 0
                                      ? history.map(() => safeNumber(experimento.temp_max_ideal))
                                      : [safeNumber(experimento.temp_max_ideal)],
                                  color: (opacity = 0.8) => `rgba(255, 75, 43, ${opacity})`,
                                  withDots: false,
                                  strokeDashArray: [5, 5],
                              },
                              {
  
                                  data: history && history.length > 0
                                      ? history.map(() => safeNumber(experimento.temp_min_ideal))
                                      : [safeNumber(experimento.temp_min_ideal)],
                                  color: (opacity = 0.8) => `rgba(37, 117, 252, ${opacity})`,
                                  withDots: false,
                                  strokeDashArray: [5, 5],
                              }
    ]
  }}
  width={screenWidth - 40}
  height={220}
  chartConfig={chartConfig}
  bezier
  style={styles.chart}
/>
          <View style={styles.chartLegend}>
             <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#6A11CB'}]} /><Text style={styles.legendText}>Real</Text></View>
             <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#FF4B2B'}]} /><Text style={styles.legendText}>Max Ideal</Text></View>
             <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#2575FC'}]} /><Text style={styles.legendText}>Min Ideal</Text></View>
          </View>
        </View>

        {/* Botão de Finalização Crítica */}
        <TouchableOpacity style={styles.finalizeButton} onPress={handleFinalize}>
          <MaterialCommunityIcons name="stop-circle-outline" size={24} color="#FFF" />
          <Text style={styles.finalizeText}>Finalizar Experimento</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#FFF",
  backgroundGradientTo: "#FFF",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 1,
  useShadowColorFromDataset: false,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 5 },
  content: { padding: 20 },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
    marginBottom: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  expName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  expOwner: { fontSize: 14, color: '#666', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: 5 },
  objetivoText: { fontSize: 15, color: '#444', lineHeight: 22 },
  paramsGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  paramBox: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#EEE'
  },
  paramLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  paramValue: { fontSize: 22, fontWeight: 'bold' },
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 25,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  chart: { borderRadius: 16, marginVertical: 8 },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendText: { fontSize: 11, color: '#666', marginLeft: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  finalizeButton: {
    backgroundColor: '#FF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 40,
  },
  finalizeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
});

export default ExperimentDetailScreen;