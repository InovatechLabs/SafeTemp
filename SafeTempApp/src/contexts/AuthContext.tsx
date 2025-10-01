import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { getItem } from "../utils/storage";

const authContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadToken() {
      const token = await getItem("userToken");
      if (token) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUserToken(token);
      }
      setIsLoading(false);
    }
    loadToken();
  }, []);

  return (
    <authContext.Provider value={{ userToken, isLoading }}>
      {children}
    </authContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export { authContext, AuthProvider, useAuth };
