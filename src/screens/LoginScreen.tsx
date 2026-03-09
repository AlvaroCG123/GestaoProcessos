import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('@token_advogado');
      if (token !== null) {
        navigation.replace('Dashboard');
      } else {
        setIsChecking(false);
      }
    } catch (e) {
      setIsChecking(false);
    }
  };

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Erro', 'Por favor, preencha e-mail e senha.');
      return;
    }

    try {
      await AsyncStorage.setItem('@token_advogado', 'logado_com_sucesso');
      navigation.replace('Dashboard');
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar o login no celular.');
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JusApp</Text>
      <Text style={styles.subtitle}>Gestão de Processos</Text>

      <TextInput style={styles.input} placeholder="E-mail" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#6c757d', marginBottom: 40 },
  input: { width: '100%', height: 50, backgroundColor: '#ffffff', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#dee2e6' },
  button: { width: '100%', height: 50, backgroundColor: '#1e3a8a', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});