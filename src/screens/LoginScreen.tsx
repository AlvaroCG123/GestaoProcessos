import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../services/supabaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // FUNÇÃO PARA ENTRAR
  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Erro", "Preencha tudo!");
    
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erro no Login", "E-mail ou senha incorretos.");
      setLoading(false);
    } else {
      // O Supabase já gerencia a sessão, mas vamos salvar o token por segurança
      await AsyncStorage.setItem('@token_advogado', data.session?.access_token || '');
      navigation.replace('Dashboard');
    }
  };

  // FUNÇÃO PARA CRIAR CONTA (CADASTRO)
  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert("Erro", "Preencha tudo!");
    if (password.length < 6) return Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erro no Cadastro", error.message);
      setLoading(false);
    } else {
      Alert.alert("Sucesso!", "Conta criada! Agora você já pode entrar.");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ADVOGADO ⚖️</Text>
      <Text style={styles.subtitle}>Gestão de Processos</Text>

      <View style={styles.inputArea}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput 
          style={styles.input} 
          placeholder="seuemail@exemplo.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
          style={styles.input} 
          placeholder="******"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 20 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
            <Text style={styles.btnLoginText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnRegister} onPress={handleSignUp}>
            <Text style={styles.btnRegisterText}>Criar Nova Conta</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', justifyContent: 'center', padding: 30 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6c757d', textAlign: 'center', marginBottom: 40 },
  inputArea: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 15 },
  btnLogin: { backgroundColor: '#1e3a8a', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnLoginText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnRegister: { marginTop: 20, alignItems: 'center' },
  btnRegisterText: { color: '#1e3a8a', fontSize: 14, textDecorationLine: 'underline' }
});