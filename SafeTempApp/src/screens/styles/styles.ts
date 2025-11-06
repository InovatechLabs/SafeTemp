import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  logoutText: { fontSize: 16, color: '#4c669f', fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 15 },
  temperatureText: { fontSize: 48, fontWeight: 'bold', color: '#4c669f', textAlign: 'center' },
  statusText: { fontSize: 16, textAlign: 'center', marginTop: 10, color: '#888' },
  modalOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
},
modalContent: {
    // Estilo para a caixa branca do formulário
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '90%', 
    maxWidth: 400, // Um bom tamanho para um formulário modal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
    textAlign: 'center',
  },
  label: {
  fontSize: 14,
  color: '#333',
  marginBottom: 4,
  fontWeight: '500',
},
inputGroup: {
  marginBottom: 12,
},


  input: {
    height: 48, 
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
    fontSize: 16,
    color: '#070707ff',
  },
  
  // --- Estilos dos Botões ---
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 10, // Um pequeno espaçamento
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
    checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#555',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
  },
  cancelText: {
    color: '#555555',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  configButton: {
  backgroundColor: '#4c669f',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginTop: 10,
  alignSelf: 'center',
},

configButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusOk: { color: 'green', fontWeight: 'bold' },
  logoContainer: { marginTop: 20, marginBottom: 20 },
  safe: { borderColor: '#4CAF50', borderWidth: 3 },
  warning: { borderColor: '#FFC107', borderWidth: 3 },
  danger: { borderColor: '#F44336', borderWidth: 3 },
    temp: {
    fontSize: 56,
    fontWeight: '800',
    color: '#003B73',
  },
  sectionTitle:  { fontSize: 24, fontWeight: 'bold', color: '#333' },
  status: {
    fontSize: 18,
    marginTop: 8,
    color: '#003B73',
  },
  update: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
});