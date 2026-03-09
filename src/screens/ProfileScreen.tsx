import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Switch, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { supabase } from '../services/supabaseConfig';
import { useTheme } from '../context/ThemeContext'; 
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function ProfileScreen({ navigation }: any) {
  const { isDark, toggleTheme } = useTheme(); 
  const [userEmail, setUserEmail] = useState('');
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');
    };
    getUser();
  }, []);

  const gerarRelatorioPDF = async () => {
    setGerandoPdf(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: processos, error } = await supabase
        .from('processos')
        .select('*')
        .eq('userid', user?.id)
        .order('prazo', { ascending: true });

      if (error) throw error;

      const linhasTabela = processos?.map(p => `
        <tr>
          <td>${p.numero}</td>
          <td>${p.cliente}</td>
          <td>${p.status}</td>
          <td>${p.prazo ? p.prazo.split('-').reverse().join('/') : '-'}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <html>
          <body style="font-family: Helvetica; padding: 20px;">
            <h1 style="color: #1e3a8a; text-align: center;">Relatório de Processos</h1>
            <p><strong>Advogado:</strong> ${userEmail}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #1e3a8a; color: white;">
                  <th style="border: 1px solid #ddd; padding: 10px;">Nº Processo</th>
                  <th style="border: 1px solid #ddd; padding: 10px;">Cliente</th>
                  <th style="border: 1px solid #ddd; padding: 10px;">Status</th>
                  <th style="border: 1px solid #ddd; padding: 10px;">Prazo</th>
                </tr>
              </thead>
              <tbody>${linhasTabela || '<tr><td colspan="4">Nenhum processo encontrado</td></tr>'}</tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      
    } catch (error: any) {
      Alert.alert("Erro", "Falha ao gerar relatório: " + error.message);
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.contentPadding}>
        
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          <View style={styles.row}>
            <Text style={[styles.rowText, isDark && styles.textDark]}>Modo Escuro</Text>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme} 
              trackColor={{ false: "#767577", true: "#1e3a8a" }}
              thumbColor={isDark ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={styles.sectionTitle}>Relatórios</Text>
          <TouchableOpacity style={styles.row} onPress={gerarRelatorioPDF} disabled={gerandoPdf}>
            <Text style={[styles.rowText, isDark && styles.textDark]}>
              {gerandoPdf ? "Gerando PDF..." : "Exportar Lista (PDF)"}
            </Text>
            {!gerandoPdf && <Text style={[styles.arrow, isDark && styles.textDark]}>{'>'}</Text>}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={styles.sectionTitle}>Minha Conta</Text>
          <Text style={[styles.emailText, isDark && styles.textDark]}>{userEmail}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.btnLogout, isDark && { backgroundColor: '#331a1a', borderColor: '#552222' }]} 
          onPress={() => { supabase.auth.signOut(); navigation.replace('Login'); }}
        >
          <Text style={styles.btnLogoutText}>Sair do Aplicativo</Text>
        </TouchableOpacity>

        <Text style={styles.version}>v1.2.3 | Pelotas-RS</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#121212' },
  contentPadding: { padding: 20, paddingTop: 30 },
  textDark: { color: '#ffffff' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 15, elevation: 2 },
  sectionDark: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#999', marginBottom: 15, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  rowText: { fontSize: 16, color: '#333', fontWeight: '500' },
  emailText: { fontSize: 15, color: '#444' },
  arrow: { color: '#ccc', fontSize: 18 },
  btnLogout: { marginTop: 10, backgroundColor: '#fff0f0', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ffcccc' },
  btnLogoutText: { color: '#dc3545', fontWeight: 'bold' },
  version: { textAlign: 'center', marginTop: 30, marginBottom: 30, color: '#ccc', fontSize: 11 }
});