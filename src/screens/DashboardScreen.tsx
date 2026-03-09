import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nossa lista de processos falsos para testar o visual
const processosMock = [
  {
    id: '1',
    numero: '5001234-56.2023.8.21.0022',
    cliente: 'João da Silva',
    parteContraria: 'Banco do Brasil S.A.',
    vara: '1ª Vara Cível de Pelotas',
    status: 'Prazo Aberto',
    corStatus: '#dc3545' // Vermelho
  },
  {
    id: '2',
    numero: '5009876-54.2022.8.21.0022',
    cliente: 'Maria Oliveira',
    parteContraria: 'Estado do RS',
    vara: 'Juizado Especial da Fazenda Pública',
    status: 'Aguardando Sentença',
    corStatus: '#198754' // Verde
  },
  {
    id: '3',
    numero: '5013344-11.2024.8.21.0022',
    cliente: 'Carlos Souza',
    parteContraria: 'Seguradora Y',
    vara: '2ª Vara Cível de Pelotas',
    status: 'Audiência Marcada',
    corStatus: '#ffc107' // Amarelo
  }
];

export default function DashboardScreen({ navigation }: any) {
  
  // O botão de sair blindado
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@token_advogado');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.log('Erro ao deslogar:', error);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card} 
      // Esta é a linha mágica que adicionamos:
      onPress={() => navigation.navigate('Details', { processo: item })}
    >
      <Text style={styles.numeroProcesso}>{item.numero}</Text>
      
      <View style={styles.linhaPartes}>
        <Text style={styles.clienteText}>{item.cliente}</Text>
        <Text style={styles.versusText}> X </Text>
        <Text style={styles.parteContrariaText}>{item.parteContraria}</Text>
      </View>
      
      <Text style={styles.varaText}>{item.vara}</Text>
      
      <View style={[styles.tagStatus, { backgroundColor: item.corStatus }]}>
        <Text style={styles.tagStatusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meus Processos</Text>
          <Text style={styles.subtitle}>Resumo do dia</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* A lista renderizada */}
      <FlatList
        data={processosMock}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 40, 
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' },
  subtitle: { fontSize: 14, color: '#6c757d' },
  logoutButton: { padding: 8, borderRadius: 6, backgroundColor: '#f8d7da' },
  logoutText: { color: '#dc3545', fontWeight: 'bold', fontSize: 12 },
  listaContainer: { padding: 20 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#dee2e6',
    elevation: 2 
  },
  numeroProcesso: { fontSize: 14, fontWeight: 'bold', color: '#495057', marginBottom: 8 },
  linhaPartes: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  clienteText: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  versusText: { fontSize: 14, color: '#6c757d', fontWeight: 'bold' },
  parteContrariaText: { fontSize: 14, color: '#6c757d' },
  varaText: { fontSize: 12, color: '#adb5bd', marginBottom: 12 },
  tagStatus: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  tagStatusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});