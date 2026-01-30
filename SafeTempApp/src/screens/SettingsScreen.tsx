import { View, Text, Button, StatusBar, ScrollView, Modal, TextInput, Animated, TouchableOpacity } from "react-native"
import AlertasModal from "../components/config/AlertsList"
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import api from "../../services/api";
import { styles } from "./styles/styles";
import { Logo } from "./HomeScreen";
import stconfig from '../.././assets/stconfig.png';
import { Alert } from "../utils/types/Alerts";
import TwoFactorActiveScreen from "../components/config/TwoFactorActive";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const [alertasAtivos, setAlertasAtivos] = useState<Alert[]>([]);

  const navigation = useNavigation<any>();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const { isGuest } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleOpenEditModal = (id: number, nomeAtual: string | null | undefined) => {
    setEditingId(id);
    setNovoNome(nomeAtual ?? ""); 
    setModalVisible(true);
  };

  const handleSaveName = async () => {
    if (editingId !== null) {
    
      await handleChangeName(editingId, novoNome); 
      setModalVisible(false); 
      setEditingId(null);    
    }
  };

useFocusEffect(
    useCallback(() => {
      carregarAlertas();
    }, [])
  );

  const carregarAlertas = async () => {
    if (isGuest) return;

    setLoading(true);
    try {
      const response = await api.get<Alert[]>('alerts/list');
      setAlertasAtivos(response.data);
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
    }
  };

  const handleDesativar = async (id: number) => {
 
    setAlertasAtivos(prev =>
      prev.map(a => a.id === id ? { ...a, ativo: false } : a)
    );

    try {
      await api.patch(`alerts/disable/${id}`);
      carregarAlertas(); 
    } catch (error) {
      console.error("Erro ao desativar alerta:", error);
    }
  };

    const handleAtivar = async (id: number) => {

      setAlertasAtivos(prev =>
        prev.map(a => a.id === id ? { ...a, ativo: true } : a)
      );

    try {
      await api.patch(`alerts/enable/${id}`);
      carregarAlertas();
    } catch (error) {
      console.error("Erro ao ativar alerta:", error);
    }
  };

  const handleExcluir = async (id: number) => {
    setAlertasAtivos(prev => prev.filter(a => a.id !== id));

    try {
      await api.delete(`alerts/delete/${id}`);
      carregarAlertas();
    } catch (error) {
      console.error("Erro ao excluir alerta:", error);
    }
  };

  const handleChangeName = async (id: number, novoNome: string) => {
    try {
      await api.patch(`alerts/editname/${id}`, {
        nome: novoNome
      });
      carregarAlertas();
    } catch (e) {
      console.error(e);
    }
  }

  return (
  <View style={{ flex: 1, backgroundColor: '#fff' }}> 
    <StatusBar barStyle="dark-content" />

    <ScrollView 
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      showsVerticalScrollIndicator={true}
    >
      <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
        
        <View style={styles.logoContainer}>
          <Logo source={stconfig} /> 
        </View>

        <View style={styles.mainContent}>
          {isGuest ? (
        
            <Animated.View style={styles.guestCard}>
              <View style={styles.guestIconCircle}>
                <MaterialCommunityIcons name="shield-lock-outline" size={40} color="#6A11CB" />
              </View>
              <Text style={styles.guestTitle}>Área Restrita</Text>
              <Text style={styles.guestDesc}>
                Para criar alertas personalizados e gerenciar notificações de temperatura, você precisa estar logado.
              </Text>
              
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => navigation.navigate('Welcome')} 
              >
                <LinearGradient
                  colors={['#6A11CB', '#6A11CB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.btnText}>Criar minha conta</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
                <AlertasModal
          alertas={alertasAtivos}
          onDesativarAlerta={handleDesativar}
          onAtivarAlerta={handleAtivar}
          onExcluirAlerta={handleExcluir}
          onChangeName={handleChangeName}
          onPressEdit={handleOpenEditModal}
          scrollEnabled={false}
        />
          )}
      </View>
      </View>
      <View style={{ marginTop: 20, padding: 10 }}>
         <TwoFactorActiveScreen />
      </View>

    </ScrollView>

    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ width: 300, backgroundColor: "white", borderRadius: 10, padding: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>Editar Nome do Alerta</Text>
          
          <TextInput
            style={{ 
                width: '100%', 
                borderWidth: 1, 
                borderColor: '#ccc', 
                borderRadius: 5, 
                padding: 10, 
                marginBottom: 20 
            }}
            placeholder="Digite o novo nome"
            value={novoNome}
            onChangeText={setNovoNome}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", width: '100%' }}>
            <Button title="Cancelar" color="red" onPress={() => setModalVisible(false)} />
            <Button title="Salvar" onPress={handleSaveName} />
          </View>
        </View>
      </View>
    </Modal>

  </View>
);
};