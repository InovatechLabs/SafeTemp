import React, { useState } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components/native';
import { registerForPushNotificationsAsync } from '../utils/notifications/notifications';
import axios from 'axios';
import api from '../../services/api';
import * as SecureStore from 'expo-secure-store';
import { GuestAccessModal } from '../components/auth/guest/GuestAccessModal';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const logoImage = require('../../assets/logost.png');

const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 300px;
  height: 100px;
`;

export const ButtonTouchable = styled(TouchableOpacity)`
  border-radius: 25px;
  overflow: hidden;
  margin-top: 20px;
`;

export const GuestButtonTouchable = styled(TouchableOpacity)`
  margin-top: 25px;
  width: 80%; 
  align-self: center;
  border-radius: 16px;
  overflow: hidden;
`;

export const GuestButtonContainer = styled.View`
  background-color: rgba(255, 255, 255, 0.15);
  padding: 14px 20px;
  border-width: 1.5px;
  border-color: rgba(76, 102, 159, 0.4); 
  border-style: dashed;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
`;

export const GuestText = styled.Text`
  color: #4c669f;
  font-size: 15px;
  font-weight: 600;
  margin-left: 8px;
`;

export const GradientButton = styled.View`
  background-color: #4b2a59; /* fallback para mobile */
  padding: 12px 30px;
  align-items: center;
  justify-content: center;
`;

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { signIn, enterAsGuest } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);  

  const handleGuestAccess = async () => {
  const hasSeenPopup = await SecureStore.getItemAsync('guest_popup_viewed');

  const proceed = () => enterAsGuest();

  if (hasSeenPopup === 'true') {
    proceed();
  } else {
    setShowGuestModal(true);
  }
};

const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    
    try {
      const operation = await signIn(email, password);

      if (!operation.success) {
        Alert.alert('Erro no Login', operation.message || 'Não foi possível entrar.');
        setLoading(false);
        return;
      }

      if (operation.requires2FA) {
        setLoading(false); 
        navigation.navigate("TwoFactor", {
          tempToken: operation.tempToken,
        });
        return;
      }

      if (operation.token) {
        await SecureStore.setItemAsync("token", operation.token);

        api.defaults.headers.Authorization = `Bearer ${operation.token}`;
        try {
            const expoPushToken = await registerForPushNotificationsAsync();
            if (expoPushToken) {
                await api.post('alerts/save-token', { expoPushToken });
            }
        } catch (pushError) {
            console.log("Erro não bloqueante ao salvar push token:", pushError);
        }
      }

    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", "Ocorreu um erro inesperado ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8E8E8" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.logoContainer}>
          <Logo source={logoImage} />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>FAÇA SEU LOGIN</Text>
          <TextInput style={styles.input} placeholder="E-mail:" placeholderTextColor='#7c7c7c' value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Sua senha:" placeholderTextColor='#7c7c7c' value={password} onChangeText={setPassword} secureTextEntry />
                      <ButtonTouchable onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                        <GradientButton>
                          {loading ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                              Entrar
                            </Text>
                          )}
                        </GradientButton>
                      </ButtonTouchable>
          
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} disabled={loading}>
            <Text style={styles.loginText}>
              Não possui conta? <Text style={styles.loginLink}>Cadastre-se aqui</Text>
            </Text>
          </TouchableOpacity>
        </View>
 <GuestButtonTouchable 
  onPress={handleGuestAccess}
  activeOpacity={0.7}
>
  <GuestButtonContainer>
    <MaterialCommunityIcons name="account-search-outline" size={20} color="#4c669f" />
    <GuestText>Acessar como Visitante</GuestText>
  </GuestButtonContainer>
</GuestButtonTouchable>
<GuestAccessModal 
    visible={showGuestModal}
    onClose={() => setShowGuestModal(false)}
    onConfirm={async () => {
      await SecureStore.setItemAsync('guest_popup_viewed', 'true');
      setShowGuestModal(false);
      enterAsGuest(); 
    }}
  />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const LoginScreenWrapper = ({ navigation }: any) => (
  <SafeAreaProvider>
    <LoginScreen navigation={navigation} />
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E8E8E8' },
    keyboardView: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    logoContainer: { marginBottom: 30, alignItems: 'center' },
    logo: { width: 150, height: 50, resizeMode: 'contain' },
    card: { width: '90%', maxWidth: 400, backgroundColor: 'white', borderRadius: 20, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 25, alignSelf: 'flex-start' },
    input: { width: '100%', height: 55, backgroundColor: '#F7F7F7', borderRadius: 15, paddingHorizontal: 20, fontSize: 16, marginBottom: 15, color: 'black' },
    button: { width: '100%', height: 60, borderRadius: 15, marginTop: 20, backgroundColor: '#4c669f', justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    loginText: { marginTop: 25, color: '#888', textAlign: 'center', fontSize: 15 },
    loginLink: { fontWeight: 'bold', color: '#4c669f' },
});

export default LoginScreenWrapper;