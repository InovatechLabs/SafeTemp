
import axios from 'axios';
import api from './api';
import { DataItem, DataItemArray } from '../src/utils/types/DataItem';


export const getHistory6h = async (): Promise<DataItem[]> => {

    try {
        const response = await axios.get<DataItem[]>(`${api.defaults.baseURL}data/history1h`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getHistory = async (date?: string): Promise<DataItemArray> => {
  try {
    const response = await axios.get<DataItemArray>(`${api.defaults.baseURL}data/history`, {
      params: date ? { date } : {},
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao pegar histórico:", error);
    throw error;
  }
};