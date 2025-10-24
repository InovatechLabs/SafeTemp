import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions, SafeAreaView, StatusBar, Button, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome5';
import historyst from '../../assets/historyst.png';
import styled from 'styled-components/native';
import DateInput from '../components/inputs/dateInput';
import { DataItem } from '../utils/types/DataItem';
import { getHistory} from '../../services/temperature';
import { ButtonTouchable, GradientButton } from './LoginScreen';

const screenWidth = Dimensions.get('window').width;

const TemperatureHistoryScreen = () => {

  const [date, setDate] = React.useState<Date | null>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);

        const dateString = date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
            date.getDate()
          ).padStart(2, '0')}`
        : undefined;
      
      const response = await getHistory(dateString);
      setData(response);

    } catch (err) {
      console.error("Erro ao fetch history:", err);

    } finally {
      setLoading(false);
    }
  }

const chartData = data.length > 0
  ? {
      labels: data.map((item) => {
        const date = new Date(item.timestamp);
        const hours = date.getUTCHours();
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      }),
      datasets: [
        {
          data: data.map((item) => Number(item.value)),
        },
      ],
    }
  : {
      labels: ["08:00", "09:00", "10:00", "11:00", "12:00"],
      datasets: [
        {
          data: [20, 21.5, 23, 22, 24],
          color: () => "rgba(255, 255, 255, 0.6)", 
        },
      ],
    };
  
  const chartConfig = {
    backgroundGradientFrom: '#4b2a59', 
    backgroundGradientTo: '#ce6e46',   
    decimalPlaces: 0, 
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ce6e46',
    },
  };

  // Cálculos dos dados 

  const max = (campo: keyof DataItem): number => {
    if (data.length == 0) return 0;
    return Math.max(...data.map((d) => Number(d[campo])));
  }

  const min = (campo: keyof DataItem): number => {
    if (data.length == 0) return 0;
    return Math.min(...data.map((d) => Number(d[campo])));
  }

  const avg = (campo: keyof DataItem): number => {
    if (data.length == 0) return 0;
    const sum = data.reduce((acc, d) => acc + Number(d[campo]), 0);
    return parseFloat((sum / data.length).toFixed(2));
  }

 return (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="light-content" />
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ alignItems: 'center', paddingBottom: 80 }} // 👈 espaço extra pro bottom tab
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <Logo source={historyst} />
      </View>

      <View style={{ padding: 16 }}>
        <DateInput value={date} onChange={setDate} placeholder="Data do evento" />
        <TouchableOpacity>
          <ButtonTouchable onPress={fetchHistory} disabled={loading} activeOpacity={0.8}>
            <GradientButton>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  Pesquisar
                </Text>
              )}
            </GradientButton>
          </ButtonTouchable>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>Histórico de Temperatura</Text>

      <LineChart
        data={chartData}
        width={screenWidth * 0.9}
        height={250}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      <View style={styles.infoCardsContainer}>
        <InfoCard icon="thermometer-half" label="Temp. Média" value={avg("value")} />
        <InfoCard icon="sun" label="Máxima Registrada" value={max("value")} />
        <InfoCard icon="snowflake" label="Mínima Registrada" value={min("value")} />
      </View>
    </ScrollView>
  </SafeAreaView>
);

};


const InfoCard = ({ icon, label, value }) => {
  return (
    <View style={styles.card}>
      <Icon name={icon} size={24} color="#3498db" />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
};

// Folha de estilos
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
   logoContainer: { marginTop: 20, marginBottom: 20 },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f8f9fa', 
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '31%', 
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLabel: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 12,
    textAlign: 'center',
  },
  cardValue: {
    marginTop: 5,
    color: '#0f172a',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 330px;
  height: 100px;
`;

export default TemperatureHistoryScreen;