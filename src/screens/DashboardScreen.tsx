import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView,
  TextInput 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabaseConfig';
import { useTheme } from '../context/ThemeContext'; // Importando o tema global

export default function DashboardScreen({ navigation }: any) {
  const { isDark } = useTheme(); // Puxando o estado do Dark Mode
  const [processos, setProcessos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [busca, setBusca] = useState('');

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

  useFocusEffect(useCallback(() => { fetchProcessos(); }, []));

  const formatarDataBR = (data: string) => {
    if (!data) return null;
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const processosFiltrados = processos
    .filter(p => {
      const atendeStatus = filtroAtivo === 'Todos' || p.status === filtroAtivo;
      const atendeBusca = p.cliente.toLowerCase().includes(busca.toLowerCase()) || p.numero.includes(busca);
      return atendeStatus && atendeBusca;
    })
    .sort((a, b) => {
      if (!a.prazo && !b.prazo) return 0;
      if (!a.prazo) return 1;
      if (!b.prazo) return -1;
      return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
    });

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.card, isDark && styles.cardDark]} 
      onPress={() => navigation.navigate('Details', { processo: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.numeroProcesso, isDark && styles.textMutedDark]}>{item.numero}</Text>
        {item.prazo && (
          <View style={[styles.prazoBadge, isDark && styles.prazoBadgeDark]}>
            <Text style={[styles.prazoBadgeText, isDark && styles.prazoBadgeTextDark]}>📅 {formatarDataBR(item.prazo)}</Text>
          </View>
        )}
      </View>

      <View style={styles.linhaPartes}>
        <Text style={[styles.clienteText, isDark && styles.textDark]}>{item.cliente}</Text>
        <Text style={styles.versusText}> X </Text>
        <Text style={[styles.parteContrariaText, isDark && styles.textMutedDark]}>{item.parte_contraria || 'Não informada'}</Text>
      </View>
      
      <View style={[styles.tagStatus, { backgroundColor: item.corstatus || '#6c757d' }]}>
        <Text style={styles.tagStatusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Cabeçalho */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>Meus Processos</Text>
          <Text style={[styles.headerSubtitle, isDark && styles.textMutedDark]}>{processosFiltrados.length} encontrados</Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileBtn, isDark && styles.profileBtnDark]} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={[styles.searchArea, isDark && styles.headerDark]}>
        <TextInput 
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="Buscar por cliente ou número..."
          value={busca}
          onChangeText={setBusca}
          placeholderTextColor={isDark ? "#666" : "#999"}
        />
      </View>

      {/* Filtros */}
      <View style={[styles.filtroContainer, isDark && styles.headerDark]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtroScroll}>
          {['Todos', 'Novo Processo', 'Urgente', 'Audiência', 'Finalizado'].map((status) => (
            <TouchableOpacity 
              key={status} 
              style={[
                styles.btnFiltro, 
                isDark && styles.btnFiltroDark,
                filtroAtivo === status && styles.btnFiltroAtivo
              ]}
              onPress={() => setFiltroAtivo(status)}
            >
              <Text style={[
                styles.txtFiltro, 
                isDark && styles.txtFiltroDark,
                filtroAtivo === status && styles.txtFiltroAtivo
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={processosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchProcessos} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isDark && styles.textMutedDark]}>Nenhum processo encontrado.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // CONTAINER
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#121212' },
  
  // HEADER
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff' },
  headerDark: { backgroundColor: '#1e1e1e', borderBottomWidth: 0 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e3a8a' },
  headerSubtitle: { fontSize: 13, color: '#6c757d' },
  textDark: { color: '#fff' },
  textMutedDark: { color: '#999' },
  
  profileBtn: { width: 40, height: 40, backgroundColor: '#f0f4ff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#d0d7de' },
  profileBtnDark: { backgroundColor: '#333', borderColor: '#444' },
  profileIcon: { fontSize: 20 },

  // BUSCA
  searchArea: { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 10 },
  searchInput: { backgroundColor: '#f1f3f5', padding: 12, borderRadius: 10, fontSize: 15, borderWidth: 1, borderColor: '#e9ecef', color: '#333' },
  searchInputDark: { backgroundColor: '#2c2c2c', borderColor: '#444', color: '#fff' },

  // FILTROS (Centralizados com justifyContent e alignItems)
  filtroContainer: { backgroundColor: '#fff', paddingBottom: 15 },
  filtroScroll: { paddingHorizontal: 20, gap: 10 },
  btnFiltro: { 
    paddingHorizontal: 15, 
    height: 38, 
    borderRadius: 20, 
    backgroundColor: '#eee', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  btnFiltroDark: { backgroundColor: '#333' },
  btnFiltroAtivo: { backgroundColor: '#1e3a8a' },
  txtFiltro: { fontSize: 13, color: '#666', fontWeight: '500', textAlign: 'center' },
  txtFiltroDark: { color: '#bbb' },
  txtFiltroAtivo: { color: '#fff', fontWeight: 'bold' },

  // LISTA E CARDS
  listaContainer: { padding: 15, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardDark: { backgroundColor: '#1e1e1e', shadowColor: '#000', shadowOpacity: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  numeroProcesso: { fontSize: 11, color: '#999' },
  
  prazoBadge: { backgroundColor: '#fff0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#ffcdd2' },
  prazoBadgeDark: { backgroundColor: '#3d1a1a', borderColor: '#6b2a2a' },
  prazoBadgeText: { fontSize: 10, color: '#d32f2f', fontWeight: 'bold' },
  prazoBadgeTextDark: { color: '#ff8a80' },

  linhaPartes: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 },
  clienteText: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  versusText: { fontSize: 14, color: '#dc3545', fontWeight: 'bold', marginHorizontal: 4 },
  parteContrariaText: { fontSize: 15, color: '#444' },
  
  tagStatus: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  tagStatusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#999' },
  
  // BOTÃO FLUTUANTE
  fab: { position: 'absolute', right: 25, bottom: 45, backgroundColor: '#1e3a8a', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 35, marginTop: -4 },
});