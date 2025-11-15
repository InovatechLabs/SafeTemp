import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { getItem, saveItem, deleteItem } from "../utils/storage";
import { loginUser } from "../../services/auth"; 
import * as SecureStore from 'expo-secure-store';

// Criamos o contexto
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se já existe um token salvo ao iniciar o app
  useEffect(() => {
    async function loadToken() {
      try {
        const token = await getItem("userToken");
        if (token) {
          api.defaults.headers.Authorization = `Bearer ${token}`;
          setUserToken(token);
        }
      } catch (error) {
        console.error("Erro ao carregar token:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      const response = await loginUser({ email, password });

      if (response?.token) {
        await SecureStore.setItemAsync("token", response.token);
        api.defaults.headers.Authorization = `Bearer ${response.token}`;
        setUserToken(response.token);
        return { success: true, token: response.token };
      } else {
        throw new Error("Token não recebido do servidor");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { success: false, message: error.message };
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      await deleteItem("userToken");
      delete api.defaults.headers.Authorization;
      setUserToken(null);

    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
