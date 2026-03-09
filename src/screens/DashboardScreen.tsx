import React, { useState, useCallback } from 'react'; // Adicionamos useCallback
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Importe necessário para o refresh automático
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseConfig';

export default function DashboardScreen({ navigation }: any) {
  const [processos, setProcessos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

 const fetchProcessos = async () => {
  try {
    // 1. Pegamos o ID do usuário que está logado agora
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // 2. Filtramos no banco: traga processos onde o userid é igual ao ID do cara
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .eq('userid', user.id) // <--- ESSA LINHA FAZ A MÁGICA
      .order('id', { ascending: false });

    if (error) throw error;
    setProcessos(data || []);
  } catch (error: any) {
    console.error('Erro:', error.message);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // --- MÁGICA DA ATUALIZAÇÃO AUTOMÁTICA ---
  // Substituímos o useEffect por este bloco aqui:
  useFocusEffect(
    useCallback(() => {
      fetchProcessos();
    }, [])
  );
  // ----------------------------------------

  const onRefresh = () => {
    setRefreshing(true);
    fetchProcessos();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@token_advogado');
    navigation.replace('Login');
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Details', { processo: item })}
    >
      <Text style={styles.numeroProcesso}>{item.numero}</Text>
      
      <View style={styles.linhaPartes}>
        <Text style={styles.clienteText}>{item.cliente}</Text>
        <Text style={styles.versusText}> X </Text>
        <Text style={styles.parteContrariaText}>{item.parte_contraria}</Text>
      </View>
      
      <Text style={styles.varaText}>{item.vara}</Text>
      
      <View style={[styles.tagStatus, { backgroundColor: item.corstatus || '#6c757d' }]}>
        <Text style={styles.tagStatusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.containerCentro}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 10, color: '#6c757d' }}>Carregando processos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meus Processos</Text>
          <Text style={styles.headerSubtitle}>{processos.length} processos ativos</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Processos */}
      <FlatList
        data={processos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listaContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum processo encontrado.</Text>
            <Text style={styles.emptySubtext}>Clique no + para cadastrar.</Text>
          </View>
        }
      />

      {/* BOTÃO FLUTUANTE (+) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerCentro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 20, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e3a8a' },
  headerSubtitle: { fontSize: 13, color: '#6c757d' },
  logoutButton: { padding: 8, backgroundColor: '#fff0f0', borderRadius: 6 },
  logoutText: { color: '#dc3545', fontWeight: 'bold', fontSize: 12 },
  listaContainer: { padding: 15, paddingBottom: 100 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  numeroProcesso: { fontSize: 12, color: '#999', marginBottom: 5 },
  linhaPartes: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 },
  clienteText: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  versusText: { fontSize: 14, color: '#dc3545', fontWeight: 'bold', marginHorizontal: 4 },
  parteContrariaText: { fontSize: 15, color: '#444' },
  varaText: { fontSize: 12, color: '#666', marginBottom: 12 },
  tagStatus: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  tagStatusText: { color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#444', fontWeight: 'bold' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 5 },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#1e3a8a',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#fff',
    fontSize: 35,
    marginTop: -4,
  },
});