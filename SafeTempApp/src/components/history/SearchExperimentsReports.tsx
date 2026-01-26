import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDateForAPI } from '../../utils/formatters/isoDate';
import api from '../../../services/api';
import axios from 'axios';
import { ReportStats, ReportUIModel } from '../../utils/types/reports';
import { Experimento } from '../../utils/types/experiments';

interface SearchReportsProps {
    onSearchSuccess: (data: Experimento[]) => void;
    onLoading: (status: boolean) => void; 
}

export default function SearchExperimentsReports({ onLoading, onSearchSuccess }: SearchReportsProps) {
      const [dateStart, setDateStart] = useState(new Date());
      const [dateEnd, setDateEnd] = useState(new Date());
      const [time, setTime] = useState<Date | null>(null);
      
    
      const [showPicker, setShowPicker] = useState(false);
      const [mode, setMode] = useState<'date' | 'time'>('date');
      const [currentField, setCurrentField] = useState<'start' | 'end' | 'time' | null>(null);
    
    
   
  const showMode = (currentMode: 'date' | 'time', field: 'start' | 'end' | 'time') => {
    setShowPicker(true);
    setMode(currentMode);
    setCurrentField(field);
  };


  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowPicker(Platform.OS === 'ios');

    if (event.type === 'set' || Platform.OS === 'ios') {
      if (currentField === 'start') setDateStart(currentDate);
      if (currentField === 'end') setDateEnd(currentDate);
      if (currentField === 'time') setTime(currentDate);
    }
    
    if (Platform.OS === 'android') {
        setShowPicker(false);
    }
  };

 
  const formatDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatTime = (date: Date) => {
    return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
  };

  const handleSearch = async () => {

  onLoading(true);

  const startStr = formatDateForAPI(dateStart);
  const endStr = formatDateForAPI(dateEnd);

  const d1 = new Date(dateStart).setHours(0,0,0,0);
  const d2 = new Date(dateEnd).setHours(0,0,0,0);

  if (d1 > d2) {
    Alert.alert("Data Inválida", "A data inicial não pode ser posterior à data final.");
    return;
  }

try {
    const url = startStr === endStr 
      ? `experiments/per-day?data=${startStr}` 
      : `experiments/interval?inicio=${startStr}&fim=${endStr}`;
    
    const response = await api.get(url); 
    const data = response.data;

    if (data) {
      onSearchSuccess(data); 
    } else {
       Alert.alert("Erro", "Não foi possível buscar os relatórios.");
    }

  } catch (error) {
    console.error(error);
    Alert.alert("Erro", "Falha na conexão com o servidor.");
  } finally {
        onLoading(false); 
    }
};
 return (
    <View style={styles.container}>
      
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#333" style={{marginLeft: 8}} />
        <Text style={styles.sectionTitle}>Busca de Experimentos</Text>

      </View>

      <View style={styles.row}>
        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => showMode('date', 'start')}
        >
          <MaterialCommunityIcons name="calendar-range" size={20} color="#ce6e46" />
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Data Inicial</Text>
            <Text style={styles.value}>{formatDate(dateStart)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => showMode('date', 'end')}
        >
          <MaterialCommunityIcons name="calendar-range" size={20} color="#ce6e46" />
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Data Final</Text>
            <Text style={styles.value}>{formatDate(dateEnd)}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={[styles.dateInput, styles.fullWidth, { paddingRight: 10 }]}>

      <TouchableOpacity 
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => showMode('time', 'time')}
        >
          <MaterialCommunityIcons name="clock-outline" size={20} color="#ce6e46" />
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Horário (Opcional)</Text>
            <Text style={[styles.value, !time && { color: '#999', fontWeight: 'normal' }]}>
              {time ? formatTime(time) : '-- : --'}
            </Text>
          </View>
        </TouchableOpacity>
        {/*  Botao de limpar horario selecionado  */}
        {time && (
          <TouchableOpacity onPress={() => setTime(null)}>
             <MaterialCommunityIcons name="close-circle" size={24} color="#999" />
          </TouchableOpacity>
        )}
    </View>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearch}
      >
        <Text style={styles.searchButtonText}>BUSCAR</Text>
      </TouchableOpacity>
    

      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={
            currentField === 'start' ? dateStart : 
            currentField === 'end' ? dateEnd : 
            (time || new Date()) 
          }
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}

    </View>
  );

}


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff', 
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ce6e46', 
    borderRadius: 12,
    padding: 12,
    width: '48%',
    backgroundColor: '#FFF',
  },
  fullWidth: {
    width: '100%',
    marginBottom: 20,
  },
  textWrapper: {
    marginLeft: 10,
  },
  label: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#ce6e46', 
    paddingVertical: 15,
    borderRadius: 25, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});