import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../../../services/api';
import { useNavigation } from '@react-navigation/native';

export default function TwoFactorSetupScreen() {
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState("");
  const [otpAuthUrl, setOtpAuthUrl] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const generateSecret = async () => {
      try {
        const response = await api.post('2fa/enable-2fa'); 
        setSecret(response.data.secret);
        setOtpAuthUrl(response.data.otpauth_url);
      } catch (error) {
        Alert.alert("Erro", "Falha ao gerar segredo 2FA.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    generateSecret();
  }, []);

    const handleOpenAuthenticator = async () => {
        if (!otpAuthUrl) {
            Alert.alert("Aguarde", "O link ainda não foi gerado.");
            return;
        }
        try {
            await Linking.openURL(otpAuthUrl);
        } catch (err) {
            Alert.alert(
                "Atenção",
                "Não foi possível abrir o app automaticamente. Verifique se você tem o Google Authenticator ou Authy instalado."
            );
        }
    };

  const handleVerifyAndActivate = async () => {
    if (tokenInput.length < 6) {
      Alert.alert("Erro", "Digite os 6 dígitos do código.");
      return;
    }
    setVerifying(true);
    try {
      await api.post('2fa/verify-2fa', {
        token2FA: tokenInput,
        secret: secret 
      });

      Alert.alert("Sucesso", "2FA Ativado com sucesso!");
      navigation.goBack(); 
      
    } catch (error: any) {
      const msg = error.response?.data?.message || "Código incorreto. Tente novamente.";
      Alert.alert("Erro", msg);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
            <Ionicons name="arrow-back" size={24} color="black" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Configurar 2FA</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.subtitle}>
          Adicione o token ao seu autenticador e confirme o código abaixo para ativar.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Método 1: Automático</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenAuthenticator}>
            <MaterialIcons name="open-in-new" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Abrir no App Autenticador</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <Text style={styles.label}>Método 2: Manual</Text>
          <View style={styles.copyContainer}>
            <Text style={styles.secretText}>{secret}</Text>
          </View>
          <Text style={styles.helper}>Copie esta chave se o botão acima não funcionar.</Text>
        </View>

        <Text style={styles.sectionTitle}>Confirmação</Text>
        <Text style={styles.helperInput}>Insira o código de 6 dígitos gerado pelo app:</Text>

        <TextInput
          style={styles.input}
          value={tokenInput}
          onChangeText={setTokenInput}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity 
          style={styles.verifyButton} 
          onPress={handleVerifyAndActivate}
          disabled={verifying}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verificar e Ativar</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  card: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  copyContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  secretText: {
    flex: 1,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#333',
    textAlign: 'center',
  },
  copyIcon: {
    padding: 5,
  },
  helper: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  helperInput: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 20,
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});