import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { getItem, saveItem, deleteItem } from "../utils/storage";
import { ApiResponse, loginUser, SignInResult } from "../../services/auth"; 
import * as SecureStore from 'expo-secure-store';
import { AuthContextProps } from "../utils/types/AuthContext";


const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: any) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


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
 const signIn = async (email: string, password: string): Promise<SignInResult> => {
  try {
    const response = await loginUser({ email, password });

    if (response.requires2FA) {
      return {
        success: true,
        requires2FA: true,
        tempToken: response.tempToken, 
      };
    }

    if (response?.token) {
      await SecureStore.setItemAsync("userToken", response.token);
      api.defaults.headers.Authorization = `Bearer ${response.token}`;
      setUserToken(response.token);

      return {
        success: true,
        token: response.token,
      };
    }

    return { success: false, message: "Token não recebido" };

  } catch (error: any) {
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

  const finalizeLogin = async (token: string) => {
      setUserToken(token); 
      api.defaults.headers.Authorization = `Bearer ${token}`;
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        isLoading,
        signIn,
        signOut,
        finalizeLogin,
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
