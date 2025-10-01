import React, { useState } from 'react';
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
import { registerUser } from '../../services/auth';

const logoImage = require('../../assets/logost.png');

const SignUpScreen = ({ navigation }) => {
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

    const values = { name, email, password} ;
    try {
      await registerUser(values);

      Alert.alert('Sucesso!', 'Sua conta foi criada. Faça o login para continuar.');
      navigation.navigate('Login');

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('Erro no Cadastro', error.response.data.message);
      } else {
        console.error("Erro não esperado:", error);
        Alert.alert('Erro no Cadastro', 'Não foi possível se conectar ao servidor. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8E8E8" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logo} />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>CRIE SUA CONTA</Text>
          <TextInput style={styles.input} placeholder="Nome:" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="E-mail:" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Crie uma senha:" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastre-se</Text>}
          </TouchableOpacity>
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

const SignUpScreenWrapper = ({ navigation }) => (
  <SafeAreaProvider>
    <SignUpScreen navigation={navigation} />
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E8E8E8' },
    keyboardView: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    logoContainer: { marginBottom: 30, alignItems: 'center' },
    logo: { width: 150, height: 50, resizeMode: 'contain' },
    card: { width: '90%', maxWidth: 400, backgroundColor: 'white', borderRadius: 20, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 25, alignSelf: 'flex-start' },
    input: { width: '100%', height: 55, backgroundColor: '#F7F7F7', borderRadius: 15, paddingHorizontal: 20, fontSize: 16, marginBottom: 15 },
    button: { width: '100%', height: 60, borderRadius: 15, marginTop: 20, backgroundColor: '#4c669f', justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    loginText: { marginTop: 25, color: '#888', textAlign: 'center', fontSize: 15 },
    loginLink: { fontWeight: 'bold', color: '#4c669f' },
});

export default SignUpScreenWrapper;