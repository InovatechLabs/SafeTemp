import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Dimensions, TouchableOpacity, Modal, Button, Text, StyleSheet, TextInput } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DataItem } from '../../utils/types/DataItem';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  data: DataItem[];
}

const InternalChart = React.memo(({ chartData, chartConfig, foundIndex }: any) => {
  return (
    <LineChart
      data={chartData}
      width={Dimensions.get('window').width - 32}
      height={220}
      yAxisSuffix="°C"
      renderDotContent={({ x, y, index }) => {
        if (index === foundIndex) {
          return (
            <Svg key={index} style={{ position: 'absolute' }}>
              <Circle cx={x} cy={y} r="8" fill="rgba(106, 17, 203, 0.3)" />
              <Circle cx={x} cy={y} r="5" fill="#6A11CB" stroke="#fff" strokeWidth="2" />
            </Svg>
          );
        }
        return null;
      }}
      chartConfig={chartConfig}
      style={styles.chart}
    />
  );
});

const TemperatureChart: React.FC<Props> = ({ data }) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [searchTime, setSearchTime] = useState('');
  const [foundTemp, setFoundTemp] = useState<string | null>(null);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);

    const hasRecords = data && data.length > 0;

const handleTextChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
    }
    setSearchTime(formatted);
  };

const executeSearch = () => {
    if (searchTime.length === 5) {
      const index = data.findIndex(item => formatTimeBRT(item.timestamp) === searchTime);
      
      if (index !== -1) {
        setFoundIndex(index);
        setFoundTemp(`${Number(data[index].value).toFixed(1)}°C`);
      } else {
        setFoundIndex(null);
        setFoundTemp("N/A");
      }
    }
  };

const formatTimeBRT = useCallback((timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const clearSearch = () => {
    setSearchTime('');
    setFoundTemp(null);
    setFoundIndex(null);
  };

const chartData = useMemo(() => {
    if (!hasRecords) {
      return {
        labels: ["08:00", "09:00", "10:00", "11:00", "12:00"],
        datasets: [{ data: [20, 21.5, 23, 22, 24], color: () => "rgba(255, 255, 255, 0.6)" }],
      };
    }
    return {
      labels: data.map((item, index) => index % 15 === 0 ? formatTimeBRT(item.timestamp) : ""),
      datasets: [{ data: data.map(item => Number(item.value)) }],
    };
  }, [data, hasRecords, formatTimeBRT]);
 
  return (
    <View style={styles.container}>
      <InternalChart 
        chartData={chartData} 
        chartConfig={chartConfig} 
        foundIndex={foundIndex} 
      />
               <Text style={styles.containerTitle}>Buscar valor por horário</Text>
       <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#6A11CB" />
          <TextInput
            style={styles.searchInput}
            placeholder="Ex: 17:15"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
            maxLength={5}
            value={searchTime}
            onChangeText={handleTextChange}
          />
          <TouchableOpacity onPress={executeSearch} style={styles.searchIconButton}>
            <MaterialCommunityIcons name="magnify" size={22} color="#6A11CB" />
          </TouchableOpacity>
        </View>
        
        {foundTemp && (
          <TouchableOpacity onPress={clearSearch} style={styles.resultBadge}>
            <Text style={styles.resultText}>{foundTemp}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const chartConfig = {
backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(106, 17, 203, ${opacity})`, 
  labelColor: (opacity = 1) => `rgba(113, 128, 150, ${opacity})`, 
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "0", 
  },
  propsForBackgroundLines: {
    strokeDasharray: "", 
    stroke: "#EDF2F7", 
  },
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 20 },
  textContainer: {  },
  chart: { marginVertical: 8, borderRadius: 16 },
  button: { backgroundColor: '#242e5c', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  closeButton: { position: 'absolute', top: 40, right: 20 },
  closeText: { color: '#fff', fontSize: 18 },
 searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  containerTitle: { fontSize: 14, fontWeight: 600, marginBottom: 10, marginTop: 0 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC', 
    borderRadius: 12,
    paddingHorizontal: 12,
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
 searchIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
  
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#2D3748',
    height: '100%', 
  },
  resultBadge: {
    backgroundColor: '#6A11CB', 
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  resultText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  expandButton: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 5,
  }
});

export default TemperatureChart;
