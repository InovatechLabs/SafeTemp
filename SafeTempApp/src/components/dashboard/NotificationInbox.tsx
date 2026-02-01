import { Modal, TouchableOpacity, View, Text, FlatList } from "react-native";
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { StyleSheet } from "react-native";

export const NotificationInbox = ({ visible, onClose, notifications, onMarkAsRead }: any) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.inboxContainer}>
          <View style={styles.inboxHeader}>
            <Text style={styles.inboxTitle}>Notificações</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.notiCard, !item.read && styles.unreadCard]}>
                <View style={styles.notiIconWrapper}>
                  <MaterialCommunityIcons 
                    name={item.title.includes('Alerta') ? 'alert-circle' : 'check-circle'} 
                    size={22} 
                    color={item.title.includes('Alerta') ? '#F59E0B' : '#10B981'} 
                  />
                </View>
                <View style={styles.notiContent}>
                  <Text style={styles.notiTitle}>{item.title}</Text>
                  <Text style={styles.notiBody}>{item.content}</Text>
                  <Text style={styles.notiTime}>{new Date(item.sent_at).toLocaleTimeString()}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma notificação por enquanto.</Text>
            }
          />
          
          <TouchableOpacity style={styles.readAllBtn} onPress={onMarkAsRead}>
            <Text style={styles.readAllText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  inboxContainer: { 
    backgroundColor: '#FFF', 
    height: '70%', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 20 
  },
  inboxHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  inboxTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  notiCard: { 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 16, 
    backgroundColor: '#F8FAFC', 
    marginBottom: 10,
    alignItems: 'center'
  },
  unreadCard: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  notiIconWrapper: { marginRight: 12 },
  notiContent: { flex: 1 },
  notiTitle: { fontWeight: 'bold', fontSize: 14, color: '#1E293B' },
  notiBody: { fontSize: 13, color: '#64748B', marginTop: 2 },
  notiTime: { fontSize: 11, color: '#94A3B8', marginTop: 5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6A11CB' },
  readAllBtn: { marginBottom: 25, alignItems: 'center', padding: 10 },
  readAllText: { color: '#6A11CB', fontWeight: 'bold' },
  badge: { 
    position: 'absolute', 
    right: -4, 
    top: -4, 
    backgroundColor: '#EF4444', 
    borderRadius: 10, 
    width: 18, 
    height: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  emptyText: {
    color: '#f1f1f1',
    fontSize: 16
  }
});