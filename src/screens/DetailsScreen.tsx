import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import { supabase } from '../services/supabaseConfig';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DetailsScreen({ route, navigation }: any) {
  const { processo } = route.params;
  const [statusAtual, setStatusAtual] = useState(processo.status);
  const [corAtual, setCorAtual] = useState(processo.corstatus);
  const [atualizando, setAtualizando] = useState(false);
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);

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
      Alert.alert("Erro", "Não foi possível atualizar o status.");
      setAtualizando(false);
    } else {
      setStatusAtual(novoStatus);
      setCorAtual(novaCor);
      setAtualizando(false);
      setMostrarOpcoes(false);
    }
  };

  const eliminarProcesso = async () => {
    const { error } = await supabase.from('processos').delete().eq('id', processo.id);
    if (!error) navigation.goBack();
    else Alert.alert("Erro", "Não foi possível remover o processo.");
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

        {mostrarOpcoes && (
          <View style={styles.btnGrid}>
            {[
              { nome: 'Em Andamento', cor: '#28a745' },
              { nome: 'Audiência', cor: '#ffc107' },
              { nome: 'Urgente', cor: '#dc3545' },
              { nome: 'Finalizado', cor: '#6c757d' }
            ].map((op) => (
              <TouchableOpacity 
                key={op.nome}
                style={[styles.btnOpcao, { borderColor: op.cor }]} 
                onPress={() => mudarStatus(op.nome, op.cor)}
              >
                <Text style={[styles.btnOpcaoText, { color: op.cor }]}>{op.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.label}>Cliente</Text>
        <Text style={styles.valor}>{processo.cliente}</Text>

        <Text style={styles.label}>Parte Contrária</Text>
        <Text style={styles.valor}>{processo.parte_contraria || 'Não informado'}</Text>

        {/* EXIBIÇÃO DO PRAZO */}
        <Text style={styles.label}>Prazo / Próxima Audiência</Text>
        <Text style={[styles.valor, { color: '#dc3545' }]}>{processo.prazo || 'Sem prazo definido'}</Text>

        <Text style={styles.label}>Vara / Tribunal</Text>
        <Text style={styles.valor}>{processo.vara || 'Não informada'}</Text>

        {/* EXIBIÇÃO DAS ANOTAÇÕES */}
        <Text style={styles.label}>Anotações Gerais</Text>
        <View style={styles.notasBox}>
          <Text style={styles.notasTexto}>{processo.anotacoes || 'Nenhuma nota adicionada.'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.btnDelete} 
          onPress={() => Alert.alert("Excluir", "Tem certeza que deseja apagar este processo?", [{text: "Não"}, {text: "Sim", onPress: eliminarProcesso}])}
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
  notasBox: { marginTop: 8, padding: 12, backgroundColor: '#fff9e6', borderRadius: 8, borderWidth: 1, borderColor: '#ffeeba' },
  notasTexto: { fontSize: 14, color: '#856404', fontStyle: 'italic' },
  btnDelete: { marginTop: 40, padding: 10, alignItems: 'center' },
  btnDeleteText: { color: '#d32f2f', fontSize: 12 },
  backButton: { marginTop: 20, marginBottom: 60, alignItems: 'center' },
  backButtonText: { color: '#1e3a8a', fontWeight: 'bold' }
});