import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import { supabase } from '../services/supabaseConfig';

// Ativa a animação suave no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DetailsScreen({ route, navigation }: any) {
  const { processo } = route.params;
  const [statusAtual, setStatusAtual] = useState(processo.status);
  const [corAtual, setCorAtual] = useState(processo.corstatus);
  const [atualizando, setAtualizando] = useState(false);
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false); // Controle do menu

  const abrirJusBrasil = () => {
    const url = `https://www.jusbrasil.com.br/busca?q=${processo.numero}`;
    Linking.openURL(url);
  };

  const toggleOpcoes = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMostrarOpcoes(!mostrarOpcoes);
  };

  const mudarStatus = async (novoStatus: string, novaCor: string) => {
    setAtualizando(true);
    const { error } = await supabase
      .from('processos')
      .update({ status: novoStatus, corstatus: novaCor })
      .eq('id', processo.id);

    if (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
      setAtualizando(false);
    } else {
      setStatusAtual(novoStatus);
      setCorAtual(novaCor);
      setAtualizando(false);
      setMostrarOpcoes(false); // Fecha o menu após mudar
    }
  };

  const eliminarProcesso = async () => {
    const { error } = await supabase.from('processos').delete().eq('id', processo.id);
    if (!error) navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Número do Processo</Text>
        <Text style={styles.valor}>{processo.numero}</Text>

        <TouchableOpacity style={styles.btnLink} onPress={abrirJusBrasil}>
          <Text style={styles.btnLinkText}>Consultar no JusBrasil 🔍</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* STATUS CLICÁVEL */}
        <Text style={styles.label}>Status (Clique para alterar)</Text>
        <TouchableOpacity 
          style={[styles.statusBadge, { backgroundColor: corAtual || '#6c757d' }]} 
          onPress={toggleOpcoes}
          activeOpacity={0.7}
        >
          {atualizando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.statusText}>{statusAtual}</Text>
              <Text style={{ color: '#fff', marginLeft: 8, fontSize: 10 }}>{mostrarOpcoes ? '▲' : '▼'}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* OPÇÕES QUE APARECEM/SOMEM */}
        {mostrarOpcoes && (
          <View style={styles.btnGrid}>
            <TouchableOpacity style={[styles.btnOpcao, { borderColor: '#28a745' }]} onPress={() => mudarStatus('Em Andamento', '#28a745')}>
              <Text style={[styles.btnOpcaoText, { color: '#28a745' }]}>Em Andamento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOpcao, { borderColor: '#ffc107' }]} onPress={() => mudarStatus('Audiência', '#ffc107')}>
              <Text style={[styles.btnOpcaoText, { color: '#ffc107' }]}>Audiência</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOpcao, { borderColor: '#dc3545' }]} onPress={() => mudarStatus('Urgente', '#dc3545')}>
              <Text style={[styles.btnOpcaoText, { color: '#dc3545' }]}>Urgente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOpcao, { borderColor: '#6c757d' }]} onPress={() => mudarStatus('Finalizado', '#6c757d')}>
              <Text style={[styles.btnOpcaoText, { color: '#6c757d' }]}>Finalizado</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.label}>Cliente</Text>
        <Text style={styles.valor}>{processo.cliente}</Text>

        <Text style={styles.label}>Parte Contrária</Text>
        <Text style={styles.valor}>{processo.parte_contraria || 'Não informado'}</Text>

        <Text style={styles.label}>Vara</Text>
        <Text style={styles.valor}>{processo.vara}</Text>

        <TouchableOpacity 
          style={styles.btnDelete} 
          onPress={() => Alert.alert("Excluir", "Tem certeza?", [{text: "Não"}, {text: "Sim", onPress: eliminarProcesso}])}
        >
          <Text style={styles.btnDeleteText}>Remover Processo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 3, borderWidth: 1, borderColor: '#dee2e6' },
  label: { fontSize: 11, color: '#999', fontWeight: 'bold', marginTop: 15, textTransform: 'uppercase' },
  valor: { fontSize: 17, color: '#1e3a8a', fontWeight: 'bold', marginTop: 4 },
  btnLink: { marginTop: 15, backgroundColor: '#eef2ff', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnLinkText: { color: '#1e3a8a', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  statusBadge: { marginTop: 8, padding: 12, borderRadius: 8, alignItems: 'center' },
  statusText: { color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' },
  btnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 15, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8 },
  btnOpcao: { padding: 10, borderRadius: 6, borderWidth: 1, minWidth: '47%', alignItems: 'center', backgroundColor: '#fff' },
  btnOpcaoText: { fontSize: 12, fontWeight: 'bold' },
  btnDelete: { marginTop: 40, padding: 10, alignItems: 'center' },
  btnDeleteText: { color: '#d32f2f', fontSize: 12 },
  backButton: { marginTop: 20, marginBottom: 60, alignItems: 'center' },
  backButtonText: { color: '#1e3a8a', fontWeight: 'bold' }
});