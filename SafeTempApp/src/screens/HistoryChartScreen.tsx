import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, SafeAreaView, StatusBar, Button, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome5';
import historyst from '../../assets/historyst.png';
import styled from 'styled-components/native';
import DateInput from '../components/inputs/dateInput';
import { DataItem, DataItemArray } from '../utils/types/DataItem';
import { getHistory} from '../../services/temperature';
import { ButtonTouchable, GradientButton } from './LoginScreen';
import ReportsList from '../components/history/ReportsList';
import ReportModal from '../components/history/ReportModal';
import api from '../../services/api';
import { ReportStats, ReportUIModel } from '../utils/types/reports';
import SearchReports from '../components/history/SearchReports';
import { PublicExperimentsList } from '../components/history/PublicExperimentsList';

const screenWidth = Dimensions.get('window').width;

const TemperatureHistoryScreen = () => {

  const [date, setDate] = React.useState<Date | null>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportsList, setReportsList] = useState<ReportUIModel[]>([]);
  const [activeTab, setActiveTab] = useState<'geral' | 'experimentos'>('geral');

  const handleOpenReport = (report: any) => {
  setSelectedReport(report);
  setModalVisible(true);
};


  const fetchHistory = async () => {
    try {
      setLoading(true);

        const dateString = date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
            date.getDate()
          ).padStart(2, '0')}`
        : undefined;
      
      const response = await getHistory(dateString);
      setData(response.records || []);

    } catch (err) {
      console.error("Erro ao fetch history:", err);

    } finally {
      setLoading(false);
    }
  }

  const fetchTodayReports = async () => {
    setLoading(true)

    try {
      const response = await api.get('reports/today');

      if(response.data) {
            const formattedData: ReportUIModel[] = response.data.map((item: any) => {
                    let parsedStats: ReportStats = {};
                    try {
                        parsedStats = JSON.parse(item.resumo);
                    } catch (e) {
                      console.error("Erro ao parsear resumo", e);
                    }
                    const dateObj = new Date(item.data);
                    const timeFormatted = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
                    const avgTemp = parsedStats.media ? parsedStats.media.toFixed(1) : '?';
            
                    return {
                      id: item.id.toString(),
                      title: `Relatório ${item.id}`,
                      time: timeFormatted,
                      summaryText: `Temp. Média ${avgTemp}°C`,
            
                      fullData: {
                        text: item.relatorio,
                        stats: parsedStats,
                        meta: {
                          chipId: item.chip_id,
                          date: item.data,
                          criado_em: item.criado_em
                        }
                      }
                    }
              });
              setReportsList(formattedData);
      }
    } catch (e) {
      console.error("Erro ao encontrar relatorios:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchTodayReports();
  }, []);

  const MAX_POINTS = 60;

// se houver muitos dados, agrupa
const shouldGroup = data.length > MAX_POINTS;

// calcula tamanho de cada grupo (ex: se 600 pontos e MAX_POINTS=60 → grupo de 10)
const groupSize = shouldGroup ? Math.ceil(data.length / MAX_POINTS) : 1;

const groupedData: DataItem[] = [];

for (let i = 0; i < data.length; i += groupSize) {
  const group = data.slice(i, i + groupSize);
  const avgValue =
    group.reduce((sum, item) => sum + Number(item.value), 0) / group.length;

  groupedData.push({
    id: group[0].id,
    chipId: group[0].chipId,
    value: avgValue.toFixed(2),
    timestamp: group[0].timestamp, 
  });
}

const chartData = groupedData.length > 0
    ? {
        labels: groupedData.map((item, index) => {

          if (index % 5 !== 0) return "";
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

  const getArray = () => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).records)) return (data as any).records;
  return [];
};

  const max = (campo: keyof DataItem): number => {
  const arr = getArray();
  if (arr.length === 0) return 0;
  return Math.max(...arr.map((d: any) => Number(d[campo])));
};

const min = (campo: keyof DataItem): number => {
  const arr = getArray();
  if (arr.length === 0) return 0;
  return Math.min(...arr.map((d: any) => Number(d[campo])));
};

const avg = (campo: keyof DataItem): number => {
  const arr = getArray();
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc: any, d: any) => acc + Number(d[campo]), 0);
  return parseFloat((sum / arr.length).toFixed(2));
};

 return (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="light-content" />
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ alignItems: 'center', paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <Logo source={historyst} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'geral' && styles.activeTabButton]}
          onPress={() => setActiveTab('geral')}
        >
          <Text style={[styles.tabText, activeTab === 'geral' && styles.activeTabText]}>Geral</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'experimentos' && styles.activeTabButton]}
          onPress={() => setActiveTab('experimentos')}
        >
          <Text style={[styles.tabText, activeTab === 'experimentos' && styles.activeTabText]}>Experimentos</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'geral' ? (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>📑 Relatórios do dia</Text>
            <View style={styles.separator} />
          </View>

          <ReportsList
            onPressReport={handleOpenReport}
            data={reportsList}
            loading={loading}
          />

          <SearchReports 
            onSearchSuccess={(novosRelatorios) => setReportsList(novosRelatorios)}
            onLoading={(isLoading) => setLoading(isLoading)}
          />

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>📜 Histórico de Temperatura</Text>
            <View style={styles.separator} />
          </View>
          
          <View style={{ width: '90%', backgroundColor: '#f3f3f3', padding: 12, borderRadius: 12 }}>
            <View style={styles.generalInfoContainer}>
              <Text style={styles.paragraph}>
                Selecione uma data para visualização dos dados...
              </Text>
            </View>
            <DateInput value={date} onChange={setDate} placeholder="Data do evento" />
            <TouchableOpacity>
              <ButtonTouchable onPress={fetchHistory} disabled={loading} activeOpacity={0.8}>
                <GradientButton>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pesquisar</Text>}
                </GradientButton>
              </ButtonTouchable>
            </TouchableOpacity>
          </View>

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
        </>
      ) : (
        /* 3. CONTEÚDO DA ABA EXPERIMENTOS */
        <View style={{ width: '90%' }}>
           <PublicExperimentsList /> 
        </View>
      )}

      <ReportModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        reportData={selectedReport} 
      />

    </ScrollView>
  </SafeAreaView>
);

};


const InfoCard = ({ icon, label, value }: any) => {
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
    color: '#000',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 21,
  },
  activeTabButton: {
    backgroundColor: '#4A148C',
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
    color: '#333',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
  },
    buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  generalInfoContainer: {
    borderLeftColor: '4px solid #ce6e46',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff3e0',
    lineHeight: 1.4,
    color: '#333',
    fontSize: 14,
    marginTop: 10,
  },
  paragraph: { fontSize: 13, color: '#444', lineHeight: 20, marginBottom: 15, textAlign: 'justify' },
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
  headerContainer: {
    width: '100%',
    marginVertical: 15, 
    paddingHorizontal: 20,
  },
  separator: {
    height: 1,       
    backgroundColor: '#E0E0E0', 
    width: '100%',       
    borderRadius: 1,   
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