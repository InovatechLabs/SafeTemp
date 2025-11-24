import React, { useEffect, useState } from 'react';
import { View, Dimensions, TouchableOpacity, Modal, Button, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DataItem } from '../../utils/types/DataItem';

interface Props {
  data: DataItem[];
}

const TemperatureChart: React.FC<Props> = ({ data }) => {

    const [modalVisible, setModalVisible] = useState(false);
    const hasRecords = data && data.length > 0;

    const formatTimeBRT = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


 const chartData = hasRecords
    ? {
       labels: data.map((item, index) => {
          return index % 10 === 0 ? formatTimeBRT(item.timestamp) : "";
        }),
        datasets: [
          {
            data: data.map(item => Number(item.value)),
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
 
  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisSuffix="°C"
        chartConfig={chartConfig}
        style={styles.chart}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').height}
            height={Dimensions.get('window').width} 
            yAxisSuffix="°C"
            chartConfig={chartConfig}
            style={{ transform: [{ rotate: '90deg' }], marginVertical: 0 }}
            withDots={false} 
            withInnerLines={false}
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
backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff", 
  backgroundGradientTo: "#ffffff",   
  color: (opacity = 1) => `rgba(206, 110, 70, ${opacity})`, 
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, 
  decimalPlaces: 2,
  style: { borderRadius: 16 },
propsForDots: {
    r: "0",
    strokeWidth: "0"
  }
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
