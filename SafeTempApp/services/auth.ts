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

interface ApiResponseRegister {
  success: boolean;
  newUser?: {
    id: number;
    name: string;
    email: string;
    password: string;
    resetToken?: string | null;
    resetTokenExpires?: string | null;
    is2FAEnabled: boolean;
    twoFASecret?: string | null;
    backupCode?: string | null;
  };
}

interface ApiResponse {
  success: boolean;
  token?: string;
}

export const registerUser = async (user: UserRegister): Promise<ApiResponseRegister> => {
  try {
    const response = await axios.post<ApiResponseRegister>(
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
  try {
    const response = await axios.post<ApiResponse>(
      `${api.defaults.baseURL}user/login`, 
      user,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Falha ao logar usuário: ${error}`);
  }
};
