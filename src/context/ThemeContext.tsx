import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: any) => {
  const [isDark, setIsDark] = useState(false);

  // 1. Carrega a preferência quando o app abre
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('@dark_mode');
      if (savedTheme !== null) {
        setIsDark(JSON.parse(savedTheme));
      }
    };
    loadTheme();
  }, []);

  // 2. Função que muda e SALVA a preferência
  const toggleTheme = async () => {
    try {
      const newValue = !isDark;
      setIsDark(newValue);
      await AsyncStorage.setItem('@dark_mode', JSON.stringify(newValue));
    } catch (e) {
      console.error("Erro ao salvar tema", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);