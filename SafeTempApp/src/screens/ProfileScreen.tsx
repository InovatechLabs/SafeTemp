import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Linking,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext'; 
import stconfig from '../../assets/logost.png'; 

const TEAM_MEMBERS = [
  "Paulo Alexandre",
  "Pedro Oliveira",
  "Gabriel Juliani",
  "Bruno Alves",
  "Nicolas Henrique"

];

export default function ProfileScreen() {
  const { signOut } = useAuth(); 

  const handleOpenGitHub = async () => {
    const url = 'https://github.com/InovatechLabs/SafeTemp';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* CABEÇALHO COM LOGO */}
        <View style={styles.headerContainer}>
          <Image source={stconfig} style={styles.logo} />
          <Text style={styles.appVersion}>Versão 1.0.0 (Release)</Text>
        </View>

        {/* CARTÃO INSTITUCIONAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações Acadêmicas</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
               <Ionicons name="school" size={20} color="#4A148C" />
            </View>
            <View>
                <Text style={styles.label}>Instituição</Text>
                <Text style={styles.value}>FATEC - Jacareí</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
               <Ionicons name="book" size={20} color="#4A148C" />
            </View>
            <View>
                <Text style={styles.label}>Turma</Text>
                <Text style={styles.value}>4º Semestre - DSM</Text>
            </View>
          </View>
        </View>

        {/* CARTÃO DO TIME */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Equipe de Desenvolvimento</Text>
          {TEAM_MEMBERS.map((member, index) => (
            <View key={index} style={styles.memberRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.memberName}>{member}</Text>
            </View>
          ))}
        </View>

        {/* CARTÃO DE TECNOLOGIAS (O "Plus" que você pediu) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stack Tecnológica</Text>
          <View style={styles.techGrid}>
             <TechBadge name="React Native" icon="react" color="#61DAFB" />
             <TechBadge name="TypeScript" icon="language-typescript" color="#3178C6" />
             <TechBadge name="Node.js" icon="nodejs" color="#339933" />
             <TechBadge name="Prisma" icon="database" color="#2D3748" />
             <TechBadge name="IoT / ESP32" icon="chip" color="#E67E22" />
             <TechBadge name="IA Gemini" icon="robot" color="#8E44AD" />
          </View>
        </View>

        {/* BOTÃO GITHUB */}
        <TouchableOpacity style={styles.githubButton} onPress={handleOpenGitHub} activeOpacity={0.8}>
          <FontAwesome5 name="github" size={24} color="#FFF" />
          <View style={styles.githubTextContainer}>
             <Text style={styles.githubTitle}>Acessar Código Fonte</Text>
             <Text style={styles.githubSubtitle}>github.com/InovatechLabs/SafeTemp</Text>
          </View>
          <MaterialCommunityIcons name="open-in-new" size={20} color="#FFF" style={{ opacity: 0.7 }} />
        </TouchableOpacity>

        <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutText}>Sair do Aplicativo</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const TechBadge = ({ name, icon, color }: { name: string, icon: any, color: string }) => (
    <View style={styles.techBadge}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={[styles.techText, { color: color }]}>{name}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  logo: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
  },
  appVersion: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
  // CARDS
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // INFO ACADEMICA
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3E5F5', // Roxo clarinho
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  label: {
    fontSize: 12,
    color: '#888',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
    marginLeft: 55, // Alinhado com o texto
  },
  // TEAM
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ce6e46', // Laranja da sua marca
    marginRight: 10,
  },
  memberName: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  // TECH GRID
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  techText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  // GITHUB BUTTON
  githubButton: {
    flexDirection: 'row',
    backgroundColor: '#24292e', // Cor do GitHub
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4,
  },
  githubTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  githubTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  githubSubtitle: {
    color: '#BBB',
    fontSize: 12,
  },
  // FOOTER
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  userEmail: {
    color: '#999',
    fontSize: 12,
    marginBottom: 10,
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: '#FF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
});