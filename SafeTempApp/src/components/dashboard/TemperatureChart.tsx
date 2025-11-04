import React, { useEffect, useState } from 'react';
import { View, Dimensions, TouchableOpacity, Modal, Button, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getHistory6h } from '../../../services/temperature';
import { formatHour } from '../../utils/formatters/isoDate';
import Orientation from 'react-native-orientation-locker';
import { DataItem } from '../../utils/types/DataItem';

interface Props {
  data: DataItem[];
}

const TemperatureChart: React.FC<Props> = ({ data }) => {

    const [modalVisible, setModalVisible] = useState(false);

    const chartData = data.length > 0 
    ? {
    labels: data.map(d => formatHour(d.timestamp)),
  datasets: [
    {
      data: data.map((item) => Number(item.value)),
    },
  ],
  } : {
      labels: ["08:00", "09:00", "10:00", "11:00", "12:00"],
      datasets: [
        {
          data: [20, 21.5, 23, 22, 24],
          color: () => "rgba(255, 255, 255, 0.6)", 
        },
      ],
    };

  if (!data || data.length === 0) {
  return (
    <View style={styles.container}>
      <Text style={{ color: '#fff' }}>Sem dados disponíveis</Text>
    </View>
  );
}

  
  const openFullscreen = () => {
    setModalVisible(true);
    Orientation.lockToLandscape(); 
  };

  const closeFullscreen = () => {
    setModalVisible(false);
    Orientation.lockToPortrait(); 
  };
 
  return (
    <View style={styles.container}>
      {/* Gráfico normal */}
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisSuffix="°C"
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* Botão para fullscreen */}
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Ver em tela cheia</Text>
      </TouchableOpacity>

      {/* Modal fullscreen */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').height} // largura da tela
            height={Dimensions.get('window').width} // altura da tela
            yAxisSuffix="°C"
            chartConfig={chartConfig}
            style={{ transform: [{ rotate: '90deg' }], marginVertical: 0 }}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const chartConfig = {
  backgroundColor: "#1E2923",
  backgroundGradientFrom: "#4b2a59",
  backgroundGradientTo: "#ce6e46",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa726" },
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 20 },
  chart: { marginVertical: 8, borderRadius: 16 },
  button: { backgroundColor: '#242e5c', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  closeButton: { position: 'absolute', top: 40, right: 20 },
  closeText: { color: '#fff', fontSize: 18 },
});

export default TemperatureChart;
