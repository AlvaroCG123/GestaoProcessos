import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabaseConfig';

export default function DashboardScreen({ navigation }: any) {
  const [processos, setProcessos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // ESTADO PARA O FILTRO
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

  const fetchProcessos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .eq('userid', user.id)
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

  useFocusEffect(
    useCallback(() => {
      fetchProcessos();
    }, [])
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  // LÓGICA DE FILTRAGEM
  const processosFiltrados = filtroAtivo === 'Todos' 
    ? processos 
    : processos.filter(p => p.status === filtroAtivo);

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
      <View style={[styles.tagStatus, { backgroundColor: item.corstatus || '#6c757d' }]}>
        <Text style={styles.tagStatusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meus Processos</Text>
          <Text style={styles.headerSubtitle}>{processosFiltrados.length} visíveis</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* BARRA DE FILTROS */}
      <View style={{ backgroundColor: '#fff', paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtroScroll}>
          {['Todos', 'Novo Processo', 'Urgente', 'Audiência', 'Finalizado'].map((status) => (
            <TouchableOpacity 
              key={status} 
              style={[styles.btnFiltro, filtroAtivo === status && styles.btnFiltroAtivo]}
              onPress={() => setFiltroAtivo(status)}
            >
              <Text style={[styles.txtFiltro, filtroAtivo === status && styles.txtFiltroAtivo]}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={processosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listaContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchProcessos} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum processo nesta categoria.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e3a8a' },
  headerSubtitle: { fontSize: 13, color: '#6c757d' },
  logoutButton: { padding: 8, backgroundColor: '#fff0f0', borderRadius: 6 },
  logoutText: { color: '#dc3545', fontWeight: 'bold', fontSize: 12 },
  
  // ESTILOS DO FILTRO
  filtroScroll: { paddingHorizontal: 20, gap: 10, height: 40 },
  btnFiltro: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eee', height: 35 },
  btnFiltroAtivo: { backgroundColor: '#1e3a8a' },
  txtFiltro: { fontSize: 12, color: '#666', fontWeight: '500' },
  txtFiltroAtivo: { color: '#fff', fontWeight: 'bold' },

  listaContainer: { padding: 15, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 3 },
  numeroProcesso: { fontSize: 11, color: '#999', marginBottom: 5 },
  linhaPartes: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 },
  clienteText: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  versusText: { fontSize: 14, color: '#dc3545', fontWeight: 'bold', marginHorizontal: 4 },
  parteContrariaText: { fontSize: 15, color: '#444' },
  tagStatus: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  tagStatusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#999' },
  fab: { position: 'absolute', right: 25, bottom: 25, backgroundColor: '#1e3a8a', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 35, marginTop: -4 },
});