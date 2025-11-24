import axios from "axios";
import api from "./api";

interface UserRegister {
  name: string;
  email: string;
  password: string;
}

interface UserLogin {
  email: string;
  password: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  tempToken?: string;
  requires2FA?: boolean;
}

export interface SignInResult {
  success: boolean;
  token?: string;
  tempToken?: string;
  requires2FA?: boolean;
  message?: string;
}

export const registerUser = async (user: UserRegister): Promise<ApiResponse> => {
  try {
    const response = await axios.post<ApiResponse>(
      `${api.defaults.baseURL}user/register`,
      user,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error(`Falha ao registrar usuário: ${error}`);
  }
};

export const loginUser = async (user: UserLogin): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(
      'user/login', 
      user
    );
    return response.data;
};
