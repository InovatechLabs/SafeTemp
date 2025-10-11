import axios from 'axios';
import api from './api';

export interface HistoryData {
    id: number;
    value: number;
    timestamp: string;
}

export const getHistory6h = async (): Promise<HistoryData[]> => {

    try {
        const response = await axios.get<HistoryData[]>(`${api.defaults.baseURL}data/history6h`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};