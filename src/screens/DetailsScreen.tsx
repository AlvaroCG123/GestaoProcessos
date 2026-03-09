import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function DetailsScreen({ route, navigation }: any) {
  // Pegamos os dados do processo que foram passados pelo clique
  const { processo } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Número do Processo:</Text>
        <Text style={styles.valor}>{processo.numero}</Text>

        <Text style={styles.label}>Cliente:</Text>
        <Text style={styles.valor}>{processo.cliente}</Text>

        <Text style={styles.label}>Parte Contrária:</Text>
        <Text style={styles.valor}>{processo.parteContraria}</Text>

        <Text style={styles.label}>Vara / Tribunal:</Text>
        <Text style={styles.valor}>{processo.vara}</Text>

        <View style={[styles.statusBadge, { backgroundColor: processo.corStatus }]}>
          <Text style={styles.statusText}>{processo.status}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar para a Lista</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 3, borderWidth: 1, borderColor: '#dee2e6' },
  label: { fontSize: 12, color: '#6c757d', fontWeight: 'bold', marginTop: 15, textTransform: 'uppercase' },
  valor: { fontSize: 18, color: '#1e3a8a', fontWeight: 'bold' },
  statusBadge: { marginTop: 25, padding: 10, borderRadius: 8, alignItems: 'center' },
  statusText: { color: '#fff', fontWeight: 'bold' },
  backButton: { marginTop: 30, alignItems: 'center' },
  backButtonText: { color: '#1e3a8a', fontWeight: 'bold', textDecorationLine: 'underline' }
});