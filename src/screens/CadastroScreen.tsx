import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Linking, Alert, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView 
} from 'react-native';
import { supabase } from '../services/supabaseConfig';
import { useTheme } from '../context/ThemeContext';
import { addDays, isWeekend, format } from 'date-fns';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

export default function CadastroScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const [numero, setNumero] = useState('');
  const [cliente, setCliente] = useState('');
  const [parte, setParte] = useState(''); 
  const [vara, setVara] = useState('');
  const [prazo, setPrazo] = useState(''); 
  const [notas, setNotas] = useState(''); 
  const [status, setStatus] = useState('Novo Processo');
  const [cor, setCor] = useState('#28a745');

  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
    })();
  }, []);

  const calcularDiasUteis = (dias: number) => {
    let dataAtual = new Date();
    let contagem = 0;
    while (contagem < dias) {
      dataAtual = addDays(dataAtual, 1);
      if (!isWeekend(dataAtual)) contagem++;
    }
    const dataFinal = format(dataAtual, 'dd/MM/yyyy');
    setPrazo(dataFinal);
    Alert.alert("Calculadora CPC", `Prazo de ${dias} dias úteis calculado para: ${dataFinal}`);
  };

  const agendarNotificacao = async (dataString: string, processoNum: string) => {
    try {
      const [dia, mes, ano] = dataString.split('/').map(Number);
      const dataAlvo = new Date(ano, mes - 1, dia, 9, 0, 0); 
      const dataLembrete = addDays(dataAlvo, -1); 

      if (dataLembrete > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "⚠️ Prazo Processual amanhã!",
            body: `O processo ${processoNum} do cliente ${cliente} vence amanhã.`,
            sound: true,
          },
          trigger: { date: dataLembrete } as Notifications.DateTriggerInput, 
        });
      }
    } catch (e) {
      // Engole o erro para não travar o salvamento no Expo Go
      console.log("Aviso: Notificações não suportadas no Expo Go.");
    }
  };

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

  const formatarPrazo = (texto: string) => {
    const limpo = texto.replace(/\D/g, '');
    let m = limpo;
    if (m.length > 8) m = m.substring(0, 8);
    if (m.length > 2) m = m.substring(0, 2) + '/' + m.substring(2);
    if (m.length > 5) m = m.substring(0, 5) + '/' + m.substring(5);
    setPrazo(m);
  };

  const salvarProcesso = async () => {
    if (numero.length < 15 || !cliente) return Alert.alert("Erro", "Preencha o número e o cliente.");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let dataFinal = null;
      if (prazo.length === 10) {
        const [dia, mes, ano] = prazo.split('/');
        dataFinal = `${ano}-${mes}-${dia}`;
        await agendarNotificacao(prazo, numero);
      }

      const { error } = await supabase.from('processos').insert([{ 
        numero, cliente, parte_contraria: parte, vara, status, 
        corstatus: cor, prazo: dataFinal, anotacoes: notas, userid: user.id 
      }]);

      if (error) throw error;
      Alert.alert("Sucesso", "Processo salvo!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, isDark && styles.containerDark]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 100} 
      >
        <ScrollView 
          style={[styles.container, isDark && styles.containerDark]} 
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <Text style={[styles.label, isDark && styles.labelDark]}>Número do Processo</Text>
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, isDark && styles.inputDark, { flex: 1 }]} 
              value={numero} onChangeText={formatarNumero} keyboardType="numeric" 
              placeholder="0000000-00..." placeholderTextColor={isDark ? "#555" : "#999"}
            />
            <TouchableOpacity 
              style={[styles.btnBusca, isDark && styles.btnBuscaDark]} 
              onPress={() => Linking.openURL(`https://www.jusbrasil.com.br/busca?q=${numero}`)}
            >
              <Text style={styles.btnBuscaText}>🔍</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, isDark && styles.labelDark]}>Cliente / Autor</Text>
          <TextInput style={[styles.input, isDark && styles.inputDark]} value={cliente} onChangeText={setCliente} placeholder="Nome do seu cliente" placeholderTextColor={isDark ? "#555" : "#999"} />

          {/* CALCULADORA CPC */}
          <Text style={[styles.label, isDark && styles.labelDark]}>Calculadora de Prazos (Dias Úteis)</Text>
          <View style={styles.calcRow}>
            {[5, 10, 15].map(d => (
              <TouchableOpacity key={d} style={[styles.btnCalc, isDark && styles.btnCalcDark]} onPress={() => calcularDiasUteis(d)}>
                <Text style={[styles.txtCalc, isDark && styles.textDark]}>+{d} Dias</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, isDark && styles.labelDark]}>Prazo Final (DD/MM/AAAA)</Text>
          <TextInput style={[styles.input, isDark && styles.inputDark]} value={prazo} onChangeText={formatarPrazo} keyboardType="numeric" placeholder="Ex: 15/05/2026" maxLength={10} placeholderTextColor={isDark ? "#555" : "#999"} />

          <Text style={[styles.label, isDark && styles.labelDark]}>Status</Text>
          <View style={styles.statusContainer}>
            {['Novo Processo', 'Urgente', 'Audiência', 'Finalizado'].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[styles.btnStatus, isDark && styles.btnStatusDark, status === item && { borderColor: '#1e3a8a', borderWidth: 2 }]} 
                onPress={() => {
                  setStatus(item);
                  const cores: any = { 'Novo Processo': '#28a745', 'Urgente': '#dc3545', 'Audiência': '#ffc107', 'Finalizado': '#6c757d' };
                  setCor(cores[item]);
                }}
              >
                <Text style={[styles.txtStatus, isDark && styles.textDark, status === item && { fontWeight: 'bold' }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, isDark && styles.labelDark]}>Anotações</Text>
          <TextInput style={[styles.input, isDark && styles.inputDark, { height: 100, textAlignVertical: 'top' }]} value={notas} onChangeText={setNotas} multiline placeholder="Notas..." placeholderTextColor={isDark ? "#555" : "#999"} />

          <TouchableOpacity style={styles.btnSalvar} onPress={salvarProcesso}>
            <Text style={styles.btnSalvarText}>Salvar Processo</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  containerDark: { backgroundColor: '#121212' },
  label: { fontSize: 11, fontWeight: 'bold', color: '#6c757d', marginBottom: 5, marginTop: 15, textTransform: 'uppercase' },
  labelDark: { color: '#777' },
  textDark: { color: '#fff' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  inputDark: { backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnBusca: { backgroundColor: '#e9ecef', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  btnBuscaDark: { backgroundColor: '#2c2c2c', borderColor: '#444' },
  btnBuscaText: { fontSize: 20 },
  calcRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  btnCalc: { flex: 1, backgroundColor: '#f0f4ff', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db' },
  btnCalcDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
  txtCalc: { fontSize: 12, fontWeight: 'bold', color: '#1e3a8a' },
  statusContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  btnStatus: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', minWidth: '45%' },
  btnStatusDark: { backgroundColor: '#2c2c2c', borderColor: '#444' },
  txtStatus: { fontSize: 12, color: '#666', textAlign: 'center' },
  btnSalvar: { backgroundColor: '#1e3a8a', padding: 18, borderRadius: 10, marginTop: 40, marginBottom: 50, alignItems: 'center' },
  btnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});