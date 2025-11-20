import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerUser } from '../../services/auth';
import styled from 'styled-components/native';

const logoImage = require('../../assets/logost.png');

// ===== STYLED COMPONENTS =====
const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 300px;
  height: 100px;
`;

const ButtonTouchable = styled(TouchableOpacity)`
  border-radius: 25px;
  overflow: hidden;
  margin-top: 20px;
`;

const GradientButton = styled.View`
  background-color: #4b2a59; /* fallback para mobile */
  padding: 12px 30px;
  align-items: center;
  justify-content: center;
`;

// Componente botão web com CSS inline
const GradientButtonWeb = ({ onClick, disabled, children }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      borderRadius: 25,
      marginTop: 20,
      padding: '20px 30px',
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
      background: 'linear-gradient(to right, #4b2a59, #ce6e46)',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </button>
);

// ===== COMPONENTE =====
const SignUpScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);

    const values = { name, email, password };
 try {
    const values = { name, email, password };
    const operation = await registerUser(values);

    if (operation.success) {
      Alert.alert('Sucesso!', 'Sua conta foi criada. Faça o login para continuar.');
      navigation.navigate('Login');
    } else {
      Alert.alert('Erro no Cadastro', 'Não foi possível criar a conta.');
    }
  } catch (error: any) {
    if (error.response?.data?.message) {
      Alert.alert('Erro no Cadastro', error.response.data.message);
    } else {
      console.error('Erro não esperado:', error);
      Alert.alert('Erro no Cadastro', 'Não foi possível se conectar ao servidor. Tente novamente mais tarde.');
    }
  } finally {
    setLoading(false);
  }
};  

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8E8E8" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <Logo source={logoImage} />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>CRIE SUA CONTA</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome:"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail:"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Crie uma senha:"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {Platform.OS === 'web' ? (
            <GradientButtonWeb onClick={handleSignUp} disabled={loading}>
              {loading ? 'Carregando...' : 'Cadastre-se'}
            </GradientButtonWeb>
          ) : (
            <ButtonTouchable onPress={handleSignUp} disabled={loading} activeOpacity={0.8}>
              <GradientButton>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                    Cadastre-se
                  </Text>
                )}
              </GradientButton>
            </ButtonTouchable>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
            <Text style={styles.loginText}>
              Já possui conta? Faça login <Text style={styles.loginLink}>clicando aqui</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ===== WRAPPER =====
const SignUpScreenWrapper = ({ navigation }: any) => (
  <SafeAreaProvider>
    <SignUpScreen navigation={navigation} />
  </SafeAreaProvider>
);

// ===== STYLES =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8E8E8' },
  keyboardView: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoContainer: { marginBottom: 30, alignItems: 'center' },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 25, alignSelf: 'flex-start' },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#F7F7F7',
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
  },
  loginText: { marginTop: 25, color: '#888', textAlign: 'center', fontSize: 15 },
  loginLink: { fontWeight: 'bold', color: '#4c669f' },
});

export default SignUpScreenWrapper;
