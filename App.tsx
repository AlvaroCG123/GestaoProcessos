import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();

function RootStack() {
  const { isDark } = useTheme();

  // 1. FORÇANDO O TEMA DO CONTAINER (Mata o fundo da navegação)
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: isDark ? '#121212' : '#f8f9fa',
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#f8f9fa' }}>
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            // 2. ISSO AQUI TIRA O FLASH BRANCO NAS TRANSIÇÕES
            animation: 'fade', // Troca o slide pelo fade (mais suave no dark mode)
            contentStyle: { backgroundColor: isDark ? '#121212' : '#f8f9fa' },
            headerStyle: {
              backgroundColor: isDark ? '#1e1e1e' : '#fff',
            },
            headerTintColor: isDark ? '#fff' : '#1e3a8a',
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar Conta' }} />      
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes do Processo' }} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Novo Processo' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Configurações' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}