import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image } from 'react-native';

import HomeScreenWrapper from '../../screens/HomeScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import HistoryScreen from '../../screens/HistoryChartScreen';
import ProfileScreen from '../../screens/ProfileScreen';

import dashicon from '../../../assets/dashboard.png';
import historyicon from '../../../assets/history.png';
import settingsicon from '../../../assets/settings.png';
import profileicon from '../../../assets/profile.png';


type BottomTabParamList = {
  Dashboard: undefined;
  Histórico: undefined;
  Configurações: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
  return (
    //@ts-ignore
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 6,
        },
        tabBarActiveTintColor: '#ce6e46',
        tabBarInactiveTintColor: '#8A8FA3',
        tabBarStyle: {
          backgroundColor: '#F0F4FF',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 16,
          right: 16,
          elevation: 8,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreenWrapper}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Dashboard</Text>,
          tabBarIcon: ({ color, size }) => (
            <Image source={dashicon} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Histórico"
        component={HistoryScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Histórico</Text>,
          tabBarIcon: ({ color, size }) => (
            <Image source={historyicon} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Configurações"
        component={SettingsScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Config.</Text>,
          tabBarIcon: ({ color, size }) => (
            <Image source={settingsicon} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Perfil</Text>,
           tabBarIcon: ({ color, size }) => (
            <Image source={profileicon} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}