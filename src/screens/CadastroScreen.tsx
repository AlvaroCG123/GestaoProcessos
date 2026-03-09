import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import { supabase } from '../services/supabaseConfig';

export default function CadastroScreen({ navigation }: any) {
  const [numero, setNumero] = useState('');
  const [cliente, setCliente] = useState('');
  const [parte, setParte] = useState('');
  const [vara, setVara] = useState('');
  const [prazo, setPrazo] = useState(''); // Estado para o Prazo
  const [notas, setNotas] = useState(''); // Estado para Anotações
  
  const [status, setStatus] = useState('Novo Processo');
  const [cor, setCor] = useState('#28a745');

  // Máscara CNJ: 0000000-00.0000.0.00.0000
  const formatarNumero = (texto: string) => {
    const limpo = texto.replace(/\D/g, '');
    let m = limpo;
    if (m.length > 20) m = m.substring(0, 20);

    if (m.length > 7) m = m.substring(0, 7) + '-' + m.substring(7);
    if (m.length > 10) m = m.substring(0, 10) + '.' + m.substring(10);
    if (m.length > 15) m = m.substring(0, 15) + '.' + m.substring(15);
    if (m.length > 17) m = m.substring(0, 17) + '.' + m.substring(17);
    if (m.length > 20) m = m.substring(0, 20) + '.' + m.substring(20);

    setNumero(m);
  };

  const selecionarStatus = (tipo: string) => {
    setStatus(tipo);
    if (tipo === 'Novo Processo') setCor('#28a745');
    if (tipo === 'Urgente') setCor('#dc3545');
    if (tipo === 'Audiência') setCor('#ffc107');
    if (tipo === 'Finalizado') setCor('#6c757d');
  };

  const salvarProcesso = async () => {
    if (numero.length < 15 || !cliente) {
      Alert.alert("Erro", "Preencha o número e o cliente.");
      return;
    }

    try {
      // Pega o ID do usuário logado para salvar no campo userid/user_id
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      const { error } = await supabase.from('processos').insert([
        { 
          numero, 
          cliente, 
          parte_contraria: parte, 
          vara, 
          status, 
          corstatus: cor,
          prazo: prazo, // Salvando o prazo
          anotacoes: notas, // Salvando as notas
          userid: user.id // Vincula ao usuário logado
        }
      ]);

      if (error) throw error;

      Alert.alert("Sucesso", "Processo cadastrado!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Número do Processo</Text>
      <View style={styles.row}>
        <TextInput 
          style={[styles.input, { flex: 1 }]} 
          value={numero} 
          onChangeText={formatarNumero} 
          keyboardType="numeric"
          placeholder="0000000-00.0000.0.00.0000"
        />
        <TouchableOpacity style={styles.btnBusca} onPress={() => Linking.openURL(`https://www.jusbrasil.com.br/busca?q=${numero}`)}>
          <Text style={styles.btnBuscaText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Cliente</Text>
      <TextInput style={styles.input} value={cliente} onChangeText={setCliente} placeholder="Nome do cliente" />

      <Text style={styles.label}>Parte Contrária</Text>
      <TextInput style={styles.input} value={parte} onChangeText={setParte} placeholder="Ex: Empresa X ou Pessoa Y" />

      <Text style={styles.label}>Status do Processo</Text>
      <View style={styles.statusContainer}>
        {['Novo Processo', 'Urgente', 'Audiência', 'Finalizado'].map((item) => (
          <TouchableOpacity 
            key={item}
            style={[styles.btnStatus, status === item && { borderColor: '#1e3a8a', borderWidth: 2 }]} 
            onPress={() => selecionarStatus(item)}
          >
            <Text style={[styles.txtStatus, status === item && { fontWeight: 'bold', color: '#1e3a8a' }]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Prazo / Próxima Audiência</Text>
      <TextInput 
        style={styles.input} 
        value={prazo} 
        onChangeText={setPrazo} 
        placeholder="DD/MM/AAAA" 
      />

      <Text style={styles.label}>Vara / Tribunal</Text>
      <TextInput style={styles.input} value={vara} onChangeText={setVara} placeholder="Ex: 1ª Vara Cível de Pelotas" />

      <Text style={styles.label}>Anotações Gerais</Text>
      <TextInput 
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
        value={notas} 
        onChangeText={setNotas} 
        multiline 
        numberOfLines={4}
        placeholder="Escreva detalhes importantes aqui..."
      />

      <TouchableOpacity style={styles.btnSalvar} onPress={salvarProcesso}>
        <Text style={styles.btnSalvarText}>Salvar Processo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#6c757d', marginBottom: 5, marginTop: 15, textTransform: 'uppercase' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnBusca: { backgroundColor: '#e9ecef', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  btnBuscaText: { fontSize: 20 },
  statusContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  btnStatus: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', minWidth: '45%' },
  txtStatus: { fontSize: 12, color: '#666', textAlign: 'center' },
  btnSalvar: { backgroundColor: '#1e3a8a', padding: 18, borderRadius: 10, marginTop: 40, marginBottom: 50, alignItems: 'center', elevation: 4 },
  btnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});