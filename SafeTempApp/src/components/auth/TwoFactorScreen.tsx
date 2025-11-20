import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import api from "../../../services/api";
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  route: any;
  navigation: any;
}

export default function TwoFactorScreen({ route, navigation }: Props) {
  const { tempToken } = route.params;
  const { finalizeLogin } = useAuth();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const [backupCode, setBackupCode] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const finalCode = code.join("");
    if (finalCode.length !== 6) {
      Alert.alert("Atenção", "Insira os 6 dígitos.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${api.defaults.baseURL}2fa/verify-login-code`,
        {
          tempToken,
          token2FA: finalCode,
        }
      );

      if (response.data?.token) {
        await SecureStore.setItemAsync("token", response.data.token);
        api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
        finalizeLogin(response.data.token);

        Alert.alert("Sucesso", "Autenticação verificada!");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", err.response?.data?.message || "Código inválido");
    } finally {
      setLoading(false);
    }
    console.log("Code array:", code);
console.log("Token final:", code.join(""));
  };

  const handleBackupSubmit = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${api.defaults.baseURL}2fa/verify-backup-code`,
        {
          backupCode,
        }
      );

      if (response.data?.token) {
        await SecureStore.setItemAsync("token", response.data.token);
        api.defaults.headers.Authorization = `Bearer ${response.data.token}`;

        setModalVisible(false);
        navigation.replace("MainTabs");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", err.response?.data?.message || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Image
          source={{
            uri: "https://static.vecteezy.com/system/resources/previews/027/769/019/non_2x/2fa-icon-two-factor-verification-by-mobile-phone-vector.jpg",
          }}
          style={styles.icon}
        />

        <Text style={styles.title}>Verifique sua identidade</Text>
        <Text style={styles.subtitle}>
          Insira o código de 6 dígitos do seu aplicativo autenticador
        </Text>

        <View style={styles.inputsWrapper}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => { inputsRef.current[index] = el; }}
              style={styles.input}
              value={digit}
              maxLength={1}
              inputMode="numeric"
              onChangeText={(v) => handleChange(v, index)}
              onKeyPress={(e) => handleKeyDown(e, index)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {loading ? "Verificando..." : "Verificar Código"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.backupTitle}>Perdeu acesso ao autenticador?</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.backupLink}>Usar código de backup</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ fontSize: 24 }}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Digite seu código de backup</Text>

            <TextInput
              style={styles.backupInput}
              value={backupCode}
              onChangeText={setBackupCode}
              maxLength={8}
              inputMode="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={handleBackupSubmit}>
              <Text style={styles.buttonText}>Usar código de backup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
  },

  icon: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },

  inputsWrapper: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },

  input: {
    width: 45,
    height: 55,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 22,
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    marginBottom: 15,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  backupTitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },

  backupLink: {
    marginTop: 4,
    fontSize: 15,
    color: "#2563eb",
    textDecorationLine: "underline",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 10,
  },

  closeModal: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },

  backupInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    marginBottom: 15,
  },
});

export const TwoFactorScreenWrapper = (props: any) => (
    <SafeAreaProvider>
        <TwoFactorScreen {...props} />
    </SafeAreaProvider>
);