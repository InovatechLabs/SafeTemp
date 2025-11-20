import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreenWrapper from './src/screens/LoginScreen';
import SignUpScreenWrapper from './src/screens/SignUpScreen';
import TemperatureHistoryScreen from './src/screens/HistoryChartScreen';
import HomeScreenWrapper from './src/screens/HomeScreen';
import { TwoFactorScreenWrapper } from './src/components/auth/TwoFactorScreen';
import BottomTabs from './src/components/navigation/BottomTabNavigator';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,    
    shouldPlaySound: true,  
    shouldSetBadge: false,   
  }),
});


const Stack = createStackNavigator();

function AuthRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreenWrapper} />
      <Stack.Screen name="SignUp" component={SignUpScreenWrapper} />
      <Stack.Screen name="TwoFactor" component={TwoFactorScreenWrapper} />
    </Stack.Navigator>
  );
}

function AppRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
    </Stack.Navigator>
  );
}

function Router() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  return userToken ? <AppRoutes /> : <AuthRoutes />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Router />
      </NavigationContainer>
    </AuthProvider>
  );
}