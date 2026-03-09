import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { supabase } from '../services/supabaseConfig';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Verifica se o usuário já está logado para pular o login
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigation.replace('Dashboard');
      }
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Aviso", "Preencha o e-mail e a senha.");
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erro no Login", "E-mail ou senha incorretos.");
      setLoading(false);
    } else {
      setLoading(false);
      navigation.replace('Dashboard');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.logo}>ADVOGADO ⚖️</Text>
        <Text style={styles.subtitle}>Gestão de Processos</Text>

        <View style={styles.inputArea}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput 
            style={styles.input} 
            placeholder="exemplo@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1e3a8a" />
        ) : (
          <>
            <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
              <Text style={styles.btnLoginText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnRegister} 
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.btnRegisterText}>
                Não tem conta? <Text style={styles.linkText}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 30 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6c757d', textAlign: 'center', marginBottom: 40 },
  inputArea: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 15 },
  btnLogin: { backgroundColor: '#1e3a8a', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnLoginText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnRegister: { marginTop: 20, alignItems: 'center' },
  btnRegisterText: { color: '#6c757d', fontSize: 14 },
  linkText: { color: '#1e3a8a', fontWeight: 'bold', textDecorationLine: 'underline' }
});