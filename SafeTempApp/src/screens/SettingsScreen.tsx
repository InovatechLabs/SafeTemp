import { View, Text, Button, StatusBar, ScrollView } from "react-native"
import AlertasModal from "../components/config/AlertsList"
import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../services/api";
import { styles } from "./styles/styles";
import { Logo } from "./HomeScreen";
import stconfig from '../.././assets/stconfig.png';

export default function SettingsScreen() {

  const [alertasAtivos, setAlertasAtivos] = useState([]);

  useEffect(() => {
    carregarAlertas();
  }, []);

  const carregarAlertas = async () => {
    try {

      const response = await api.get('alerts/list');
      setAlertasAtivos(response.data); 
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
    }
  };

  
  const handleDesativar = async (id) => {
    console.log('Desativando alerta:', id);
    try {

      await api.put(`alerts/disable/${id}`);
      

      carregarAlertas();

    } catch (error) {
      console.error("Erro ao desativar alerta:", error);
    }
  };


  const handleExcluir = async (id) => {
    console.log('Excluindo alerta:', id);
    try {

      await api.delete(`alerts/delete/${id}`);

      carregarAlertas();

    } catch (error) {
      console.error("Erro ao excluir alerta:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" />
        
            <View style={styles.logoContainer}>
                <Logo source={stconfig} />
            </View>

      <AlertasModal
        alertas={alertasAtivos}
        onDesativarAlerta={handleDesativar}
        onExcluirAlerta={handleExcluir}
      />
    </View>
  );
};