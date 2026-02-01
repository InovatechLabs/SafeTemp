import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image, TouchableOpacity, ScrollView, View } from 'react-native';

import HomeScreenWrapper from '../../screens/HomeScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import HistoryScreen from '../../screens/HistoryChartScreen';
import ProfileScreen from '../../screens/ProfileScreen';

import dashicon from '../../../assets/dashboard.png';
import historyicon from '../../../assets/history.png';
import settingsicon from '../../../assets/settings.png';
import comparisonicon from '../../../assets/profile.png';
import { SafeAreaView } from 'react-native-safe-area-context';
import ComparisonScreen from '../../screens/ComparisonScreen';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type BottomTabParamList = {
  Dashboard: undefined;
  Histórico: undefined;
  Configurações: undefined;
  Comparação: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {

  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
       {/* @ts-ignore */} 
       <Tab.Navigator
        tabBar={(props) => (
          <View style={styles.tabBarWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {props.state.routes.map((route, index) => {
                const { options } = props.descriptors[route.key];
                const isFocused = props.state.index === index;
                const color = isFocused ? '#ce6e46' : '#8A8FA3';

                const onPress = () => {
                  const event = props.navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    props.navigation.navigate(route.name);
                  }
                };

                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={onPress}
                    style={[styles.tabButton, isFocused && styles.tabButtonActive]}
                  >
                   {options.tabBarIcon && options.tabBarIcon({ 
          focused: isFocused, 
          color: color, 
          size: 30 
        })}
        
        <Text style={{ color, fontSize: 13, marginTop: 4, fontWeight: '600' }}>
          {route.name}
        </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity onPress={handleLogout} style={styles.tabButton}>
                 <MaterialCommunityIcons name="logout" size={28} color="#FF4444" />
                 <Text style={{ color: '#FF4444', fontSize: 12 }}>Sair</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        screenOptions={{ headerShown: false }}
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
          name="Comparação"
          component={ComparisonScreen}
          options={{
            tabBarLabel: ({ color }) => <Text style={{ color }}>Comparação</Text>,
            tabBarIcon: ({ color, size }) => (
              <Image source={comparisonicon} style={{ width: size, height: size, tintColor: color }} />
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
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    height: 75,
    backgroundColor: '#F0F4FF',
    elevation: 4,
    overflow: 'hidden',
  },
  scrollContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabButton: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabButtonActive: {
    borderBottomColor: '#ce6e46',
  }
});