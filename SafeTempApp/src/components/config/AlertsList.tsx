import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Alert } from '../../utils/types/Alerts';

// --- Função Helper para formatar a data/hora ---
const formatarHora = (dataString: string) => {
  if (!dataString) return 'N/A';
  const data = new Date(dataString);
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface AlertItemProps {
  item: Alert;
  onDesativar: (id: number) => void;
  onAtivar: (id: number) => void;
  onExcluir: (id: number) => void;
}


const AlertItem = ({ item, onDesativar, onAtivar, onExcluir }: AlertItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const limite = `${item.temperatura_min ?? 'N/A'}°C - ${
    item.temperatura_max ?? 'N/A'
  }°C`;
  const horario = `${formatarHora(item.hora_inicio)} - ${formatarHora(
    item.hora_fim
  )}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setExpanded((e) => !e)}
    >
      <View style={styles.itemContainer}>
        
        {/* STATUS */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.ativo ? "green" : "gray" },
            ]}
          />
          <Text style={styles.statusText}>
            Status: {item.ativo ? "Ativo" : "Inativo"}
          </Text>
        </View>

        {/* INFO RESUMIDA */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Limite: {limite}</Text>
          <Text style={styles.infoText}>Horário: {horario}</Text>
        </View>

        {expanded && (
          <View style={styles.extraContainer}>
            <Text style={styles.extraText}>ID: {item.id}</Text>
            <Text style={styles.extraText}>
              Criado em: {formatarHora(item.criado_em)}
            </Text>
            <Text style={styles.extraText}>
              Notificação ativa: {item.notificacaoAtiva ? "Sim" : "Não"}
            </Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.desativarButton]}
            onPress={() => onDesativar(item.id)}
            disabled={!item.ativo}
          >
            <Text style={styles.buttonText}>Desativar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.excluirButton]}
            onPress={() => onExcluir(item.id)}
          >
            <Text style={styles.excluirButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface AlertasListProps {
  alertas: Alert[];
  onDesativarAlerta: (id: number) => void;
  onAtivarAlerta: (id: number) => void;
  onExcluirAlerta: (id: number) => void;
}

export default function AlertasModal({ alertas, onDesativarAlerta, onAtivarAlerta, onExcluirAlerta }: AlertasListProps) {
  return (

      <SafeAreaView style={styles.container}>
        <View style={styles.modalView}>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔔  Alertas </Text>

          </View>

          <FlatList
            data={alertas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <AlertItem
                item={item}
                onDesativar={onDesativarAlerta} 
                onAtivar={onAtivarAlerta}
                onExcluir={onExcluirAlerta}    
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
  },
  modalView: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
logoContainer: { marginTop: 20, marginBottom: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#E0E0E0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemContainer: {
    paddingVertical: 15,
  },
  extraContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
  },

  extraText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontWeight: "500",
  },

  /* AJUSTE DO STATUS */
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#E0E0E0',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20, width: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginLeft: 10,
  },
  desativarButton: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  excluirButton: {
    backgroundColor: '#FF4136',
  },
  excluirButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});