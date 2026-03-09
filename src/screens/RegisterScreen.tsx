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

  // Verifica se já existe uma sessão ativa ao abrir a tela
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
      return Alert.alert("Aviso", "Por favor, preencha o e-mail e a senha.");
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erro no Login", "E-mail ou senha inválidos. Verifique os dados e tente novamente.");
      setLoading(false);
    } else {
      // Login bem-sucedido! O Supabase já guarda a sessão automaticamente.
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
        <Text style={styles.subtitle}>Gestão de Processos Jurídicos</Text>

        <View style={styles.inputArea}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput 
            style={styles.input} 
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Digite sua senha"
            placeholderTextColor="#999"
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
                Não tem uma conta? <Text style={styles.linkText}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: { 
    fontSize: 34, 
    fontWeight: 'bold', 
    color: '#1e3a8a', 
    textAlign: 'center',
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#6c757d', 
    textAlign: 'center', 
    marginBottom: 40,
    letterSpacing: 1
  },
  inputArea: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#1e3a8a', 
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#dee2e6', 
    borderRadius: 10, 
    padding: 15, 
    fontSize: 16, 
    marginBottom: 20,
    color: '#333'
  },
  btnLogin: { 
    backgroundColor: '#1e3a8a', 
    padding: 18, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 3
  },
  btnLoginText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  btnRegister: { 
    marginTop: 25, 
    alignItems: 'center' 
  },
  btnRegisterText: { 
    color: '#6c757d', 
    fontSize: 14 
  },
  linkText: { 
    color: '#1e3a8a', 
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  }
});