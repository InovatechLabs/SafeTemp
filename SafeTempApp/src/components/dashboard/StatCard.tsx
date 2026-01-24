import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: string | number;
  iconName: any; 
  color: string;
  bgColor?: string; 
  subValue?: string; 
}

export const StatCard = ({ label, value, iconName, color, bgColor, subValue }: StatCardProps) => {
  return (
    <View style={[styles.card, { backgroundColor: bgColor || '#F8F9FA' }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}> 
          <MaterialCommunityIcons name={iconName} size={22} color={color} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <View>
          <Text style={[styles.value, { color: color }]}>{value}</Text>
          {subValue && <Text style={[styles.subValue, { color: color }]}>{subValue}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%', 
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    elevation: 2, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    justifyContent: 'space-between',
    height: 130, 
  },
  header: {
      marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subValue: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
      opacity: 0.8,
  }
});