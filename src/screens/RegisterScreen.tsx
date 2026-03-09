import React, { useState } from 'react';
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

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert("Aviso", "Preenche todos os campos!");
    if (password.length < 6) return Alert.alert("Aviso", "A senha deve ter pelo menos 6 caracteres.");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    setLoading(false);
    if (error) {
      Alert.alert("Erro ao criar conta", error.message);
    } else {
      Alert.alert(
        "Conta Criada!", 
        "Agora já podes aceder com o teu e-mail e senha.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Voltar ao Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Nova Conta ⚖️</Text>
        <Text style={styles.description}>Cria o teu perfil para começares a gerir os teus processos.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail Profissional</Text>
          <TextInput 
            style={styles.input} 
            placeholder="exemplo@advogado.pt"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha de Acesso</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {loading ? (
            <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.btnRegister} onPress={handleSignUp}>
              <Text style={styles.btnText}>CRIAR MINHA CONTA</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    paddingTop: 50, // Ajustado para não ficar tão longe do topo
    paddingHorizontal: 20,
    paddingBottom: 20 
  },
  backLink: { 
    color: '#1e3a8a', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  content: { 
    paddingHorizontal: 30,
    // Removido o justifyContent center para não "flutuar" no meio da tela
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1e3a8a', 
    marginBottom: 8 
  },
  description: { 
    fontSize: 14, 
    color: '#6c757d', 
    marginBottom: 30 
  },
  form: { 
    width: '100%' 
  },
  label: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#999', 
    marginBottom: 6, 
    textTransform: 'uppercase' 
  },
  input: { 
    backgroundColor: '#f8f9fa', 
    borderWidth: 1, 
    borderColor: '#eee', 
    borderRadius: 8, 
    padding: 12, // Um pouco mais compacto
    fontSize: 16, 
    marginBottom: 15 
  },
  btnRegister: { 
    backgroundColor: '#1e3a8a', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 10, 
    elevation: 2 
  },
  btnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 15, 
    letterSpacing: 1 
  }
});