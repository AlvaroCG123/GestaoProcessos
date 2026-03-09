import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import RegisterScreen from './src/screens/RegisterScreen'; // <-- ADICIONADO

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        
        {/* NOVA TELA DE CADASTRO DE USUÁRIO */}
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar Conta' }} />
        
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Meus Processos' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes do Processo' }} />
        
        {/* TELA DE CADASTRO DE PROCESSO */}
        <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Novo Processo' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}