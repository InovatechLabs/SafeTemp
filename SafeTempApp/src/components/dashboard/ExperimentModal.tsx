import React, { useState } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, 
  StyleSheet, ScrollView, Alert, ActivityIndicator, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import api from '../../../services/api'; 
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ExperimentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExperimentModal = ({ visible, onClose, onSuccess }: ExperimentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    objetivo: '',
    min: '',
    max: ''
  });
  const [date, setDate] = useState(new Date());
const [showPicker, setShowPicker] = useState(false);
const [mode, setMode] = useState<'date' | 'time'>('date');

const onChange = (event: any, selectedDate?: Date) => {
  const currentDate = selectedDate || date;
  setShowPicker(false);
  setDate(currentDate);
};

const showMode = (currentMode: 'date' | 'time') => {
  setShowPicker(true);
  setMode(currentMode);
};

  const handleSave = async () => {
    if (!form.nome || !form.min || !form.max) {
      Alert.alert("Atenção", "Preencha o nome e as temperaturas ideais.");
      return;
    }

    setLoading(true);
    try {
      await api.post('experiments/start', {
        nome: form.nome,
        objetivo: form.objetivo,
        temp_min_ideal: parseFloat(form.min),
        temp_max_ideal: parseFloat(form.max),
        deviceId: 1,
        data_fim: date.toISOString()
      });

      Alert.alert("Sucesso", "Experimento iniciado com sucesso!");
      onSuccess();
      onClose();
      setForm({ nome: '', objetivo: '', min: '', max: '' }); 
    } catch (error) {
      Alert.alert("Erro", "Não foi possível iniciar o experimento.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

 return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.overlay}
      >
        <View style={styles.content}>
          {/* Alça visual de "modal de arrastar" */}
          <View style={styles.dragIndicator} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Configurar Experimento</Text>
              <Text style={styles.subtitle}>Defina os parâmetros científicos</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            
            {/* Input de Título */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="tag-outline" size={16} color="#6A11CB" />
                <Text style={styles.label}>Título do Projeto</Text>
              </View>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: Incubação de Enzimas"
                placeholderTextColor="#A0AEC0"
                value={form.nome}
                onChangeText={(t) => setForm({...form, nome: t})}
              />
            </View>

            {/* Input de Objetivo */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="microscope" size={14} color="#6A11CB" />
                <Text style={styles.label}>Objetivo ou Descrição</Text>
              </View>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Qual o propósito desta coleta de dados?"
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={4}
                value={form.objetivo}
                onChangeText={(t) => setForm({...form, objetivo: t})}
              />
            </View>

            {/* Seção de Temperatura */}
            <Text style={[styles.label, { marginTop: 10, marginBottom: 15 }]}>Faixa Térmica de Segurança</Text>
            <View style={styles.tempGrid}>
              <View style={styles.tempBox}>
                <Text style={styles.tempLabel}>Mínima</Text>
                <View style={styles.tempInputRow}>
                   <TextInput 
                    style={styles.tempInput} 
                    keyboardType="numeric"
                    placeholder="20"
                    placeholderTextColor={"#c2cbd8"}
                    value={form.min}
                    onChangeText={(t) => setForm({...form, min: t})}
                  />
                  <Text style={styles.tempUnit}>°C</Text>
                </View>
              </View>

              <View style={styles.tempBox}>
                <Text style={styles.tempLabel}>Máxima</Text>
                <View style={styles.tempInputRow}>
                   <TextInput 
                    style={styles.tempInput} 
                    keyboardType="numeric"
                    placeholder="40"
                    placeholderTextColor={"#c2cbd8"}
                    value={form.max}
                    onChangeText={(t) => setForm({...form, max: t})}
                  />
                  <Text style={styles.tempUnit}>°C</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 10, marginBottom: 15 }]}>Previsão de Término</Text>
<View style={styles.dateSelectorContainer}>
  <TouchableOpacity 
    style={styles.dateTimeBtn} 
    onPress={() => showMode('date')}
  >
    <MaterialCommunityIcons name="calendar-range" size={20} color="#6A11CB" />
    <Text style={styles.dateTimeText}>{date.toLocaleDateString('pt-BR')}</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={styles.dateTimeBtn} 
    onPress={() => showMode('time')}
  >
    <MaterialCommunityIcons name="clock-outline" size={20} color="#6A11CB" />
    <Text style={styles.dateTimeText}>
      {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
    </Text>
  </TouchableOpacity>
</View>

{showPicker && (
  <DateTimePicker
    value={date}
    mode={mode}
    is24Hour={true}
    onChange={onChange}
  />
)}

            {/* Botão de Início com Gradiente */}
            <TouchableOpacity 
              disabled={loading}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6A11CB', '#2575FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <View style={styles.btnRow}>
                    <Text style={styles.btnText}>ATIVAR PROTOCOLO</Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  content: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24, 
    maxHeight: '90%',
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20
  },
  dragIndicator: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A202C' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 2 },
  closeBtn: { backgroundColor: '#F7FAFC', padding: 8, borderRadius: 12 },
  inputWrapper: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#4A5568', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { 
    backgroundColor: '#F7FAFC', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 16, 
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#EDF2F7'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  tempGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  tempBox: { 
    flex: 0.47, 
    backgroundColor: '#F7FAFC', 
    borderRadius: 16, 
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7'
  },
  tempLabel: { fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4, textTransform: 'uppercase' },
  tempInputRow: { flexDirection: 'row', alignItems: 'baseline' },
  tempInput: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', flex: 1 },
  tempUnit: { fontSize: 16, color: '#A0AEC0', fontWeight: 'bold', marginLeft: 4 },
  btnGradient: { borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 10 },
  btnRow: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1, marginRight: 8 },
  dateSelectorContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 20,
},
dateTimeBtn: {
  flex: 0.48,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F7FAFC',
  padding: 15,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#EDF2F7',
},
dateTimeText: {
  marginLeft: 10,
  fontSize: 15,
  color: '#2D3748',
  fontWeight: '600',
}
});