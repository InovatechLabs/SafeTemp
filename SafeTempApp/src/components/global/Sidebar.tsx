import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  PanResponder,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// Ícones custom em SVG
const DashboardIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 13h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8zM3 3h8v8H3V3z"
      fill={color}
    />
  </Svg>
);

const ReportsIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"
      fill={color}
    />
  </Svg>
);

const HistoryIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2v2a8 8 0 1 1-8 8h2l-3 3-3-3h2a10 10 0 1 0 10-10zM11 6h2v6h-6v-2h4V6z"
      fill={color}
    />
  </Svg>
);


const LoginIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 17l5-5-5-5v10zm-7 0h6v2H3V5h6v2H3v10z"
      fill={color}
    />
  </Svg>
);

const SidebarSVG: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.5)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const { userToken, signOut } = useAuth();

  const openSidebar = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width * 0.5,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => setVisible(false));
  };

  // Swipe handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          slideAnim.setValue(Math.max(gestureState.dx, -width * 0.5));
          overlayAnim.setValue(0.5 + 0.5 * (gestureState.dx / (width * 0.5)));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -width * 0.25) closeSidebar();
        else {
          Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
            Animated.timing(overlayAnim, { toValue: 0.5, duration: 200, useNativeDriver: false }),
          ]).start();
        }
      },
    })
  ).current;

  return (
    <>
      {/* Botão para abrir sidebar */}
      {!visible && (
  <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
    <DashboardIcon size={24} color="#fff" />
  </TouchableOpacity>
)}

      {visible && (
        <>
          {/* Overlay */}
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
          </TouchableWithoutFeedback>

          {/* Sidebar */}
          <Animated.View {...panResponder.panHandlers} style={[styles.sidebar, { right: slideAnim }]}>
            <TouchableOpacity style={styles.item} onPress={() => alert('Dashboard')}>
              <DashboardIcon size={24} color="#fff" />
              <Text style={styles.itemText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={() => alert('Relatórios')}>
              <ReportsIcon size={24} color="#fff" />
              <Text style={styles.itemText}>Relatórios</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={() => alert('Relatórios')}>
              <HistoryIcon size={24} color="#fff" />
              <Text style={styles.itemText}>Histórico</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={() => alert('Login')}>
              <LoginIcon size={24} color="#fff" />
              <Text style={styles.itemText}>
                {userToken ? (
                    <Text onPress={signOut}>Sair</Text>
                ) : (
                    <Text>Login</Text>
                )}
  

              </Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: '#242e5c',
    padding: 10,
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#000',
    zIndex: 5,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.5,
    backgroundColor: '#242e5c',
    paddingTop: 70,
    paddingHorizontal: 20,
    zIndex: 9,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
  },
  itemText: {
    color: '#fff',
    fontSize: 24,
    marginLeft: 15,
  },
});

export default SidebarSVG;
