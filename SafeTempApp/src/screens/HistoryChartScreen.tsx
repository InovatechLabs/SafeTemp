import React from 'react';
import { StyleSheet, View, Text, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome5';
import historyst from '../../assets/historyst.png';
import styled from 'styled-components/native';

// Obtém a largura da tela para o gráfico responsivo
const screenWidth = Dimensions.get('window').width;

const TemperatureHistoryScreen = () => {
  // Dados do gráfico, baseados na sua imagem
  const chartData = {
    labels: ['Jan', 'Abr', 'Jul', 'Out'], // Labels mais lógicos para o eixo X
    datasets: [
      {
        data: [22, 15, 38, 34], // Valores estimados da sua imagem
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Cor da linha
        strokeWidth: 3,
      },
    ],
    legend: ['Temperatura (°C)'], // Legenda do gráfico
  };

  // Configurações visuais do gráfico
  const chartConfig = {
    backgroundGradientFrom: '#4b2a59', // Cor do gradiente (fornecida por você)
    backgroundGradientTo: '#ce6e46',   // Cor do gradiente (fornecida por você)
    decimalPlaces: 0, // Sem casas decimais nos labels
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
                <View style={styles.logoContainer}>
                  <Logo source={historyst} />
                </View>
        <Text style={styles.headerTitle}>Histórico de Temperatura</Text>

        {/* Componente do Gráfico */}
        <LineChart
          data={chartData}
          width={screenWidth * 0.9} // 90% da largura da tela
          height={250}
          chartConfig={chartConfig}
          bezier // Para curvas suaves como na imagem
          style={styles.chart}
        />

        {/* Container para os cartões de informação */}
        <View style={styles.infoCardsContainer}>
          <InfoCard
            icon="thermometer-half"
            label="Temp. Média"
            value="25°C"
          />
          <InfoCard
            icon="sun"
            label="Máxima Registirda"
            value="38°C"
          />
          <InfoCard
            icon="snowflake"
            label="Mínima Registirda"
            value="12°C"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Componente reutilizável para os cartões
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
    backgroundColor: '#fff', // Cor de fundo escura da tela
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
    backgroundColor: '#f8f9fa', // Fundo quase branco dos cartões
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '31%', // Largura de cada cartão
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
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