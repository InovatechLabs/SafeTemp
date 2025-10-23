import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, Button } from 'react-native';

import { loginUser } from '../../services/auth';
import { getItem, saveItem, deleteItem } from '../utils/storage';
import api from '../../services/api';

import { AuthProvider, useAuth } from './AuthContext'; 

jest.mock('../../services/api', () => ({
  __esModule: true, 
  default: {
    defaults: {
      headers: {
        Authorization: null, 
      },
    },
  },
}));

jest.mock('../../services/auth');
jest.mock('../utils/storage');

const mockedLoginUser = loginUser as jest.Mock;
const mockedGetItem = getItem as jest.Mock;
const mockedSaveItem = saveItem as jest.Mock;

const mockedApi = api;

const TestConsumer = () => {
  const { signIn, userToken, isLoading } = useAuth();

  const handleLogin = () => {
    signIn('test@user.com', 'password123');
  };

  if (isLoading) {
    return <Text>Carregando...</Text>;
  }

  return (
    <>
      { }
      <Text testID="token-display">Token: {userToken || 'null'}</Text>
      <Button title="Login" onPress={handleLogin} testID="login-button" />
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    if (mockedApi.defaults.headers) {
      mockedApi.defaults.headers.Authorization = null;
    }
  });

  it('deve permitir que o usuário faça login e armazene o token', async () => {
    const FAKE_TOKEN = 'fake-jwt-token-123';
    
    mockedLoginUser.mockResolvedValue({ token: FAKE_TOKEN });
    mockedGetItem.mockResolvedValue(null); 
    mockedSaveItem.mockResolvedValue(undefined);

    const { getByTestId, findByText } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await findByText('Token: null')).toBeTruthy();

    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByTestId('token-display').props.children).toEqual([
        'Token: ',
        FAKE_TOKEN,
      ]);
      
      expect(mockedLoginUser).toHaveBeenCalledWith({
        email: 'test@user.com',
        password: 'password123',
      });
      
      expect(mockedSaveItem).toHaveBeenCalledWith('userToken', FAKE_TOKEN);

      expect(mockedApi.defaults.headers.Authorization).toBe(`Bearer ${FAKE_TOKEN}`);
    });
  });
});