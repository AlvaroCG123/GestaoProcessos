import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Linking, 
  Alert, 
  ActivityIndicator, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import { supabase } from '../services/supabaseConfig';
import { useTheme } from '../context/ThemeContext'; // Importe o tema global

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DetailsScreen({ route, navigation }: any) {
  const { processo } = route.params;
  const { isDark } = useTheme(); // Pega o estado global do Dark Mode
  const [statusAtual, setStatusAtual] = useState(processo.status);
  const [corAtual, setCorAtual] = useState(processo.corstatus);
  const [atualizando, setAtualizando] = useState(false);
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);

  const exibirDataBR = (dataBD: string) => {
    if (!dataBD) return 'Sem prazo definido';
    const partes = dataBD.split('-');
    if (partes.length !== 3) return dataBD;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

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
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.card, isDark && styles.cardDark]}>
        <Text style={[styles.label, isDark && styles.labelDark]}>Número do Processo</Text>
        <Text style={[styles.valor, isDark && styles.textDark]}>{processo.numero}</Text>

        <TouchableOpacity style={[styles.btnLink, isDark && styles.btnLinkDark]} onPress={abrirJusBrasil}>
          <Text style={[styles.btnLinkText, isDark && styles.textDark]}>Consultar no JusBrasil 🔍</Text>
        </TouchableOpacity>

        <View style={[styles.divider, isDark && styles.dividerDark]} />

        <Text style={[styles.label, isDark && styles.labelDark]}>Status Atual</Text>
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
              <Text style={{ color: '#fff', marginLeft: 8, fontSize: 12 }}>{mostrarOpcoes ? '▲' : '▼'}</Text>
            </View>
          )}
        </TouchableOpacity>

        {mostrarOpcoes && (
          <View style={[styles.btnGrid, isDark && styles.btnGridDark]}>
            {[
              { nome: 'Em Andamento', cor: '#28a745' },
              { nome: 'Audiência', cor: '#ffc107' },
              { nome: 'Urgente', cor: '#dc3545' },
              { nome: 'Finalizado', cor: '#6c757d' }
            ].map((op) => (
              <TouchableOpacity 
                key={op.nome}
                style={[styles.btnOpcao, isDark && styles.btnOpcaoDark, { borderColor: op.cor }]} 
                onPress={() => mudarStatus(op.nome, op.cor)}
              >
                <Text style={[styles.btnOpcaoText, { color: op.cor }]}>{op.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.divider, isDark && styles.dividerDark]} />

        <Text style={[styles.label, isDark && styles.labelDark]}>Cliente / Autor</Text>
        <Text style={[styles.valorPrincipal, isDark && styles.textDarkPrincipal]}>{processo.cliente}</Text>

        <Text style={[styles.label, isDark && styles.labelDark]}>Parte Contrária / Réu</Text>
        <Text style={[styles.valor, isDark && styles.textDark]}>{processo.parte_contraria || 'Não informado'}</Text>

        <Text style={[styles.label, isDark && styles.labelDark]}>Prazo / Próxima Audiência</Text>
        <Text style={[styles.valor, { color: '#dc3545' }]}>{exibirDataBR(processo.prazo)}</Text>

        <Text style={[styles.label, isDark && styles.labelDark]}>Vara / Tribunal</Text>
        <Text style={[styles.valor, isDark && styles.textDark]}>{processo.vara || 'Não informada'}</Text>

        <Text style={[styles.label, isDark && styles.labelDark]}>Anotações do Advogado</Text>
        <View style={[styles.notasBox, isDark && styles.notasBoxDark]}>
          <Text style={[styles.notasTexto, isDark && styles.notasTextoDark]}>{processo.anotacoes || 'Nenhuma nota adicionada.'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.btnDelete} 
          onPress={() => Alert.alert("Excluir", "Deseja apagar permanentemente?", [{text: "Cancelar"}, {text: "Sim, Excluir", onPress: eliminarProcesso}])}
        >
          <Text style={styles.btnDeleteText}>Remover Processo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={[styles.backButtonText, isDark && styles.textDarkPrincipal]}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  containerDark: { backgroundColor: '#121212' },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 25, elevation: 4, borderWidth: 1, borderColor: '#e9ecef', marginBottom: 20 },
  cardDark: { backgroundColor: '#1e1e1e', borderColor: '#333' },
  label: { fontSize: 12, color: '#adb5bd', fontWeight: 'bold', marginTop: 18, textTransform: 'uppercase', letterSpacing: 0.5 },
  labelDark: { color: '#777' },
  valor: { fontSize: 18, color: '#495057', fontWeight: '600', marginTop: 5 },
  textDark: { color: '#bbb' },
  textDarkPrincipal: { color: '#fff' },
  valorPrincipal: { fontSize: 22, color: '#1e3a8a', fontWeight: 'bold', marginTop: 5 },
  btnLink: { marginTop: 15, backgroundColor: '#f0f4ff', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnLinkDark: { backgroundColor: '#2c2c2c' },
  btnLinkText: { color: '#1e3a8a', fontWeight: 'bold', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#f1f3f5', marginVertical: 20 },
  dividerDark: { backgroundColor: '#333' },
  statusBadge: { marginTop: 10, padding: 15, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
  btnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 15, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 12 },
  btnGridDark: { backgroundColor: '#2c2c2c' },
  btnOpcao: { padding: 12, borderRadius: 8, borderWidth: 1.5, minWidth: '47%', alignItems: 'center', backgroundColor: '#fff' },
  btnOpcaoDark: { backgroundColor: '#1e1e1e' },
  btnOpcaoText: { fontSize: 13, fontWeight: 'bold' },
  notasBox: { marginTop: 10, padding: 15, backgroundColor: '#fffcf0', borderRadius: 10, borderWidth: 1, borderColor: '#fcf2c5', minHeight: 80 },
  notasBoxDark: { backgroundColor: '#2c2c2c', borderColor: '#444' },
  notasTexto: { fontSize: 15, color: '#665c33', fontStyle: 'italic', lineHeight: 22 },
  notasTextoDark: { color: '#aaa' },
  btnDelete: { marginTop: 45, padding: 10, alignItems: 'center' },
  btnDeleteText: { color: '#fa5252', fontSize: 13, fontWeight: 'bold', textDecorationLine: 'underline' },
  backButton: { marginBottom: 60, alignItems: 'center', padding: 10 },
  backButtonText: { color: '#1e3a8a', fontWeight: 'bold', fontSize: 16 }
});