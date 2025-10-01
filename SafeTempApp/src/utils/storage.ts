import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export async function saveItem(key: string, value: string) {
  if (Platform.OS === "web") {
    console.log(`[Mock SecureStore] Salvando ${key} no Web`);
    return;
  }
  return await SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string) {
  if (Platform.OS === "web") {
    console.log(`[Mock SecureStore] Lendo ${key} no Web`);
    return null; // ou um valor fixo de teste
  }
  return await SecureStore.getItemAsync(key);
}

export async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    console.log(`[Mock SecureStore] Deletando ${key} no Web`);
    return;
  }
  return await SecureStore.deleteItemAsync(key);
}
