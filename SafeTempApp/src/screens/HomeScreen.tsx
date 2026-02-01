import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataItem } from '../utils/types/DataItem';
import api, { getNotifications } from '../../services/api';
import styled from 'styled-components/native';
import TemperatureChart from '../components/dashboard/TemperatureChart';
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import stdb from '../../assets/stdashboard.png';
import { Alert as AlertType } from '../utils/types/Alerts';
import { Statistics } from '../utils/types/Statistics';
import { StatCard } from '../components/dashboard/StatCard';
import { ExperimentoAtivo } from '../utils/types/experiments';
import { ExperimentModal } from '../components/dashboard/ExperimentModal';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Notification } from '../utils/types/notifications';
import { NotificationInbox } from '../components/dashboard/NotificationInbox';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined; 
};

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

const NotificationButton = ({ onPress, unreadCount }: { onPress: () => void, unreadCount: number }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconButton}>
    <MaterialCommunityIcons name="bell-outline" size={26} color="#1E293B" />
    {unreadCount > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const HomeScreen = ({ start }: any) => {
  const navigation = useNavigation<any>();
  const { signOut, isGuest } = useAuth(); 

  const [currentTemperature, setCurrentTemperature] = useState<DataItem | null>(null);
  const [history, setHistory] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ min: '--', max: '--', std: 0  });
  const [trend, setTrend] = useState({ icon: 'minus', color: '#adb5bd', text: 'Estável' });

  const [modalVisible, setModalVisible] = useState(false);
  const [temperaturaMin, setTemperaturaMin] = useState("");
  const [temperaturaMax, setTemperaturaMax] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [nome, setNome] = useState("");
  const [nota, setNota] = useState("");
  const [checked, setChecked] = useState(true);
  const [isAlerting, setIsAlerting] = useState(false);
  const [chartLimits, setChartLimits] = useState<{min: number, max: number } | null>(null);
  const [analytics, setAnalytics] = useState<Statistics['statistics'] | null>(null);
  const [experimento, setExperimento] = useState<ExperimentoAtivo | null>(null);
  const [expModalVisible, setExpModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadNotifications = async () => {
    const res = await getNotifications();
    setNotifications(res.data);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const deviceMac = "10711434E3EC";

const publicPromises = [
      api.get('/data/lastdata'),
      api.get('/data/history1h'), 
      api.get(`/experiments/active/${deviceMac}`),
    ];
    
    if (!isGuest) {
     const responses = await Promise.all([
    ...publicPromises,
        api.get<AlertType[]>('alerts/list'),
      ]);

const lastDataRes = responses[0] as any;
      const historyStatsRes = responses[1] as any;
      const expRes = responses[2] as any;
      const alertsRes = responses[3] as any;
      const newRecord = lastDataRes.data.lastRecord;

      setCurrentTemperature((prevRecord: any) => {
  if (prevRecord && newRecord) {
    const newVal = Number(newRecord.value);
    const prevVal = Number(prevRecord.value);

    if (newVal > prevVal) {
      setTrend({ icon: 'chevron-up', color: '#ff6b6b', text: 'Subindo' });
    } else if (newVal < prevVal) {
      setTrend({ icon: 'chevron-down', color: '#4dabf7', text: 'Descendo' });
    } else {
      setTrend({ icon: 'minus', color: '#adb5bd', text: 'Estável' });
    }
  }
  return newRecord; 
});

      setExperimento(expRes.data);
 
      const historyData = historyStatsRes.data;
      setHistory(historyData.records || []);
      
      if (historyData.statistics) {
        setAnalytics(historyData.statistics);
        setStats({
          min: historyData.statistics.min,
          max: historyData.statistics.max,
          std: historyData.statistics.desvioPadrao
        });
      }

      const alerts = alertsRes.data || [];
      const activeAlert = alerts.find((a: any) => a.ativo && a.temperatura_min != null && a.temperatura_max != null);
      setChartLimits(activeAlert ? { min: activeAlert.temperatura_min, max: activeAlert.temperatura_max } : null);
    } else {
 const responses = await Promise.all(publicPromises);
      
      const lastDataRes = responses[0] as any;
      const historyStatsRes = responses[1] as any;
      const expRes = responses[2] as any;

      setCurrentTemperature(lastDataRes.data.lastRecord);
      
      setExperimento(expRes.data || null);
      
      const historyData = historyStatsRes.data;
      setHistory(historyData.records || []);
      setChartLimits(null); 

      if (historyData.statistics) {
        setAnalytics(historyData.statistics);
        setStats({
          min: historyData.statistics.min,
          max: historyData.statistics.max,
          std: historyData.statistics.desvioPadrao
        });
      }
    }

    } catch (error) {
      console.error("Erro ao atualizar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

useFocusEffect(
  useCallback(() => {

    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 60000);
    return () => clearInterval(interval);
  }, [])
);

const handleMarkAsRead = async () => {
  try {
 
    await api.patch('notifications/read');

    setNotifications(prevNotifications => 
      prevNotifications.map(n => ({ ...n, read: true }))
    );

  } catch (error) {
    console.error("Erro ao marcar notificações como lidas:", error);
  }
};
 
  const getTimeDifference = (timestamp: string | undefined) => {
  if (!timestamp) return "Desconhecido";
  
  const now = new Date();
  const recordTime = new Date(timestamp);
  const diffMs = now.getTime() - recordTime.getTime(); 
  const diffMins = Math.floor(diffMs / 60000); 

  if (diffMins < 1) return "Agora mesmo";
  if (diffMins === 1) return "Há 1 minuto";
  if (diffMins < 60) return `Há ${diffMins} minutos`;
  
  const diffHours = Math.floor(diffMins / 60);
  return `Há ${diffHours} horas`;
};
 const lastUpdateText = getTimeDifference(currentTemperature?.timestamp);
  
  const isOffline = (() => {
    if (lastUpdateText.includes('horas') || lastUpdateText.includes('dias')) return true;

    const match = lastUpdateText.match(/(\d+)/); 
    if (match) {
      const minutes = parseInt(match[0], 10); 
      return minutes > 20; 
    }
    
    return false; 
  })();

  const getStability = (std: number) => {
    if (std < 1) return { label: "Alta Estabilidade", color: "#4CAF50", icon: "pulse" };
    if (std < 2.5) return { label: "Oscilação Normal", color: "#FFC107", icon: "wave" };
    return { label: "Alta Instabilidade", color: "#FF4444", icon: "flash" };
  };

  const handleSaveAlert = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Erro", "Usuário não autenticado");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const horaInicioISO = horaInicio ? `${today}T${horaInicio}:00` : null;
      const horaFimISO = horaFim ? `${today}T${horaFim}:00` : null;

      const response = await fetch(`${api.defaults.baseURL}alerts/register-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          temperatura_min: parseFloat(temperaturaMin),
          temperatura_max: parseFloat(temperaturaMax),
          hora_inicio: horaInicioISO,
          hora_fim: horaFimISO,
          nome: nome || null,
          nota: nota || null
        }),
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Alerta configurado com sucesso!");
        setModalVisible(false);
        setTemperaturaMin(""); setTemperaturaMax(""); setHoraInicio(""); setHoraFim(""); setNome(""); setNota(""); setChecked(true);
      } else {
        Alert.alert("Erro", "Falha ao salvar alerta. Verifique os dados.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar o alerta");
    }
  };

  const handleLogout = () => {
    signOut();
  };

  const handleExperimentDetails = () => {
    navigation.navigate('ExperimentDetail', {
      experimento,
      history,
      currentTemp: currentTemperature
    });
  }

  const normalGradient = ['#6A11CB', '#4a0c64'] as const;
  const normalStatusBg = '#4CAF50'; 
  const normalIcon = "thermometer";

  const alertGradient = ['#8B0000', '#CC2E2E'] as const; 
  const alertStatusBg = '#FFC107'; 
  const alertIcon = "alert-circle-outline";

  const currentGradient = isAlerting ? alertGradient : normalGradient;
  const currentStatusBg = isAlerting ? alertStatusBg : normalStatusBg;
  const currentStatusText = isAlerting ? "ALERTA CRÍTICO" : "Monitoramento Ativo";
  const currentIcon = isAlerting ? alertIcon : normalIcon;

const tempAtual = currentTemperature ? parseFloat(currentTemperature.value) : 0;
const isOutOfRange = experimento && 
    (tempAtual < experimento.temp_min_ideal || tempAtual > experimento.temp_max_ideal);

const experimentGradient = isOutOfRange 
    ? (['#FF4B2B', '#FF416C'] as const) // Vermelho Alerta
    : (['#6A11CB', '#2575FC'] as const); // Azul/Roxo Experimento

  return (
    <SafeAreaView style={styles.container}>
     <StatusBar 
         barStyle="light-content" 
         backgroundColor={isAlerting ? '#8B0000' : '#F4F6F9'} 
      />
    
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo source={stdb} />
        </View> 
           
        <NotificationButton 
          unreadCount={unreadCount} 
          onPress={() => setIsModalVisible(true)} 
        />
   
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboardData} />}
        showsVerticalScrollIndicator={false}
      >
<TouchableOpacity 
  activeOpacity={0.9} 
  onPress={experimento ? handleExperimentDetails : undefined}
>

<LinearGradient
    colors={experimento ? experimentGradient : currentGradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.heroCard, isOutOfRange && styles.pulseEffect]}
  >
<View style={styles.heroHeader}>
      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: experimento ? '#4CAF50' : currentStatusBg }]} />
        <Text style={styles.statusText}>
          {experimento ? 'Experimento em Curso' : currentStatusText}
        </Text>
      </View>
      <MaterialCommunityIcons 
        name={experimento ? "beaker-outline" : currentIcon} 
        size={22} 
        color="#FFF" 
        style={{ opacity: 0.8 }} 
        onPress={handleExperimentDetails}
      />
    </View>

    {experimento && (
      <View style={styles.experimentInfo}>
        <Text style={styles.expTitle}>{experimento.nome}</Text>
        <Text style={styles.expResponsavel}>Por: {experimento.responsavel.name}</Text>
      </View>
    )}

<View style={styles.tempContainer}>
      <Text style={styles.tempValue}>
        {currentTemperature ? tempAtual.toFixed(1) : '--'}
        <Text style={styles.tempUnit}>°C</Text>
      </Text>
      <Text style={styles.tempLabel}>Temperatura Atual</Text>
   
    <View style={styles.content}>
     <View style={[styles.trendBadge, { backgroundColor: trend.color + '33' }]}>
        <Icon name={trend.icon} size={12} color={trend.color} />
        <Text style={[styles.trendText, { color: trend.color }]}>{trend.text}</Text>
     </View>
  </View>
   </View>

    {experimento && (
        <View style={styles.rangeContainer}>
            <View style={styles.rangeLabels}>
                <Text style={styles.rangeText}>{experimento.temp_min_ideal}°C</Text>
                <Text style={styles.rangeText}>Ideal</Text>
                <Text style={styles.rangeText}>{experimento.temp_max_ideal}°C</Text>
            </View>
            <View style={styles.rangeBarBase}>
                <View style={[
                    styles.rangeIndicator, 
                    { left: `${((tempAtual - experimento.temp_min_ideal) / (experimento.temp_max_ideal - experimento.temp_min_ideal)) * 100}%` }
                ]} />
            </View>
        </View>
    )}

<View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>{experimento ? 'Mín. Ideal' : 'Mínima (1h)'}</Text>
        <Text style={styles.statValue}>{experimento ? experimento.temp_min_ideal : stats.min}°</Text>
      </View>
      <View style={styles.verticalDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>{experimento ? 'Máx. Ideal' : 'Máxima (1h)'}</Text>
        <Text style={styles.statValue}>{experimento ? experimento.temp_max_ideal : stats.max}°</Text>
      </View>
    </View>
                    <View style={styles.sensorStatusContainer}>

            <View style={styles.sensorInfoItem}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={20} color="#666" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.sensorLabel}>Última Leitura</Text>
                <Text style={[
                  styles.sensorValue,
                  { color: isOffline ? '#FF4444' : '#333' }
                ]}>
                  {lastUpdateText}
                </Text>
                </View>
            </View>

            <View style={styles.verticalDividerDark} />

            <View style={styles.sensorInfoItem}>
               
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.sensorLabel}>Ambiente</Text>
                    <Text style={[styles.sensorValue, { color: getStability(stats.std || 0).color }]}>
                        {getStability(stats.std || 0).label}
                    </Text>
                </View>
            </View>

        </View>
        </LinearGradient>
</TouchableOpacity>
        <TouchableOpacity 
            style={[styles.actionButton, { marginTop: -10, borderLeftWidth: 4, borderLeftColor: isGuest ? '#6e6e6e' : '#6A11CB' }]}
            onPress={() => setModalVisible(true)}
            disabled={isGuest}
        >
            <Ionicons name="settings-outline" size={20} color={isGuest ? "#6e6e6e" : "#6A11CB"} />
            <Text style={styles.actionButtonText}>
                {isGuest ? (
                  <Text style={{ color: '#6e6e6e'}}>Crie uma conta para configurar alertas</Text>
                ) : (
                  <Text>Configurar alertas</Text>
                )}
              </Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        {!experimento && (
    <TouchableOpacity 
        style={[styles.actionButton, { marginTop: -10, borderLeftWidth: 4, borderLeftColor: isGuest ? '#6e6e6e' : '#6A11CB' }]}
        onPress={() => setExpModalVisible(true)}
        disabled={isGuest}
    >
        <MaterialCommunityIcons name="beaker-plus-outline" size={22} color={isGuest ? "#6e6e6e" : "#6A11CB"} />
        <Text style={styles.actionButtonText}>
           {isGuest ? (
                  <Text style={{ color: '#6e6e6e'}}>Crie uma conta para iniciar experimentos</Text>
                ) : (
                  <Text>Iniciar experimento</Text>
                )}
          </Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
)}

        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Histórico Recente</Text>
             <Text style={styles.sectionSubtitle}>Última hora</Text>
          </View>
          
          <View style={styles.chartCard}>
             {history.length > 0 ? (
                // @ts-ignore
                <TemperatureChart data={history} />
             ) : (
                <Text style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                    {loading ? 'Carregando gráfico...' : 'Sem dados recentes.'}
                </Text>
             )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>Análise Técnica (1h)</Text>
    <Text style={styles.sectionSubtitle}>Indicadores estatísticos de qualidade</Text>

    <View style={styles.statsGridCard}>

        <View style={styles.quickSummaryRow}>
            <View style={styles.quickSummaryItem}>
                <Text style={styles.quickLabel}>Média</Text>
                <Text style={styles.quickValue}>
                    {analytics?.media ? analytics.media.toFixed(1) : '--'}°C
                </Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.quickSummaryItem}>
                <Text style={styles.quickLabel}>Mínima</Text>
                <Text style={styles.quickValue}>
                    {analytics?.min ? analytics.min.toFixed(1) : '--'}°C
                </Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.quickSummaryItem}>
                <Text style={styles.quickLabel}>Máxima</Text>
                <Text style={styles.quickValue}>
                    {analytics?.max ? analytics.max.toFixed(1) : '--'}°C
                </Text>
            </View>
        </View>

        <View style={styles.horizontalDivider} />

        <View style={styles.cardsGrid}>
            {(() => {
                const outliers = analytics?.totalOutliers || 0;
                const isCrit = outliers > 0;
                return (
                    <StatCard 
                        label="Outliers"
                        value={outliers}
                        subValue={isCrit ? "Detectados" : "Nenhum"}
                        iconName={isCrit ? "alert-octagram-outline" : "check-decagram-outline"}
                        color={isCrit ? "#FF4444" : "#4CAF50"}
                        bgColor={isCrit ? "#FFF5F5" : "#F0FFF4"}
                    />
                );
            })()}

            {(() => {
                const cv = analytics?.CVOutlier || 0;       
                const isHighVar = cv > 10;

                return (
                    <StatCard 
                        label="Coef. Variação"
                        value={`${cv.toFixed(1)}%`}
                        iconName="chart-bell-curve-cumulative"
                        color={isHighVar ? "#FFC107" : "#2A2D5D"}
                    />
                );
            })()}

            <StatCard 
                label="Desvio Padrão"
                value={`±${analytics?.desvioPadrao?.toFixed(2) || '0.00'}`}
                iconName="sigma"
                color="#666"
            />

    
            <StatCard 
                label="Variância"
                value={analytics?.variancia?.toFixed(2) || '0.00'}
                iconName="function-variant"
                color="#666"
            />
        </View>
    </View>
</View>

      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurar Alerta</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Alerta (Opcional)</Text>
              <TextInput style={styles.input} placeholder="Ex: Experimento com Fungos" placeholderTextColor={'#a3a3a3'} value={nome} onChangeText={setNome} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nota (Opcional)</Text>
              <TextInput style={styles.input} placeholder="Ex: Desativar após as 13:00h" placeholderTextColor={'#a3a3a3'} value={nota} onChangeText={setNota} />
            </View>

            <Text style={styles.sectionTitleModal}>Temperaturas</Text>
            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Mínima (°C)</Text>
                <TextInput style={styles.input} placeholder="Ex: 10" placeholderTextColor={'#a3a3a3'} keyboardType="numeric" value={temperaturaMin} onChangeText={setTemperaturaMin} />
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Máxima (°C)</Text>
                <TextInput style={styles.input} placeholder="Ex: 35" placeholderTextColor={'#a3a3a3'} keyboardType="numeric" value={temperaturaMax} onChangeText={setTemperaturaMax} />
              </View>
            </View>

            <Text style={styles.sectionTitleModal}>Período de monitoramento</Text>
            <View style={styles.switchContainer}>
              <Switch trackColor={{ false: '#ccc', true: '#4CAF50' }} thumbColor={checked ? '#fff' : '#f4f3f4'} ios_backgroundColor="#3e3e3e" onValueChange={setChecked} value={checked} />
              <Text style={styles.switchLabel}>{checked ? "Monitorar 24h" : "Definir horário específico"}</Text>
            </View>

            {!checked && (
              <View style={styles.rowContainer}>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.label}>Hora início</Text>
                  <TextInput style={styles.input} placeholder="Ex: 09:00" placeholderTextColor={'#a3a3a3'} value={horaInicio} onChangeText={setHoraInicio} />
                </View>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.label}>Hora fim</Text>
                  <TextInput style={styles.input} placeholder="Ex: 17:00" placeholderTextColor={'#a3a3a3'} value={horaFim} onChangeText={setHoraFim} />
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveAlert} style={styles.saveButton}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>

          </View>
          </ScrollView>
        </View>
      </Modal>
            <ExperimentModal 
  visible={expModalVisible} 
  onClose={() => setExpModalVisible(false)} 
  onSuccess={loadDashboardData} 
/>
<NotificationInbox 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
sensorStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sensorInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
    justifyContent: 'center', 
  },
  sensorLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  verticalDividerDark: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  mainCard: {
    backgroundColor: '#3b2657', 
    borderRadius: 30,
    padding: 24,
    width: '92%',
    alignSelf: 'center',
    shadowColor: "#2a1a3d",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 15,
    overflow: 'hidden', 
  },
  mainTemp: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 15,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  subLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: -8,
  },
  statsGridCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  experimentInfo: {
    marginBottom: 10,
    alignItems: 'center',
  },
  expTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  expResponsavel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  rangeContainer: {
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  rangeText: {
    color: '#FFF',
    fontSize: 10,
    opacity: 0.8,
  },
  rangeBarBase: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    position: 'relative',
  },
  rangeIndicator: {
    width: 10,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 5,
    position: 'absolute',
    top: -3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  pulseEffect: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  quickSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  quickSummaryItem: {
    alignItems: 'center',
  },
  tempContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10
  },
  cardSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, 
  },
  quickLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  quickValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  verticalDivider: {
    width: 2,
    height: 50,
    backgroundColor: '#E0E0E0',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
    marginHorizontal: -20,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionContainer: {
    marginTop: 25,
    marginBottom: 30,
  },
  heroCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#5f2479',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  inboxContainer: { 
    backgroundColor: '#FFF', 
    height: '70%', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 20 
  },
  inboxHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  inboxTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  notiCard: { 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 16, 
    backgroundColor: '#F8FAFC', 
    marginBottom: 10,
    alignItems: 'center'
  },
  unreadCard: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  notiIconWrapper: { marginRight: 12 },
  notiContent: { flex: 1 },
  notiTitle: { fontWeight: 'bold', fontSize: 14, color: '#1E293B' },
  notiBody: { fontSize: 13, color: '#64748B', marginTop: 2 },
  notiTime: { fontSize: 11, color: '#94A3B8', marginTop: 5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6A11CB' },
  readAllBtn: { marginTop: 15, alignItems: 'center', padding: 10 },
  readAllText: { color: '#6A11CB', fontWeight: 'bold' },
  badge: { 
    position: 'absolute', 
    left: -4, 
    top: -4, 
    backgroundColor: '#EF4444', 
    borderRadius: 10, 
    width: 18, 
    height: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tempValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tempUnit: {
    fontSize: 24,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.7)',
  },
  tempLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  iconButton: {
    position: 'relative', 
    padding: 8,
    marginRight: 10, 
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  logoContainer: { marginTop: 20, marginBottom: 20 },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  // --- CHART SECTION ---
  chartSection: {
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    margin: 5
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginLeft: 5,
    marginBottom: 5
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScrollView: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitleModal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 20,
  },
  halfInputContainer: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
  },
  switchLabel: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#ce6e46', 
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 330px;
  height: 100px;
`;

type WrapperProps = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreenWrapper = ({ navigation }: WrapperProps) => (
  <SafeAreaProvider>
    <HomeScreen />
  </SafeAreaProvider>
);

export default HomeScreenWrapper;