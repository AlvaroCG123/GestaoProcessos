import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Processos</Text>
      <Text style={styles.subtitle}>Bem-vindo, Doutor!</Text>
      
      <View style={styles.card}>
        <Text>Você não tem audiências hoje.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#6c757d', marginBottom: 40 },
  card: { padding: 20, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', marginTop: 20 }
});