import React, { createContext, useState, useMemo } from "react";

const themes = {
  light: {
    background: "#f5f5f5", // Светлый фон
    text: "#11", // Тёмный текст
    primary: "#FF740F", // Акцентный цвет для кнопок
    secondary: "#FFFFFF", // Дополнительный цвет
    cardBackground: "#FFFFFF", // Фон карточек
    textOnPrimary: "#FFFFFF", // Текст на кнопках с акцентным цветом
  },
  dark: {
    background: "#111318", // Тёмный фон
    text: "#F0F0F0", // Светлый текст
    primary: "#FF740F", // Акцентный цвет для кнопок
    secondary: "#333333", // Дополнительный цвет
    cardBackground: "#1C1C1C", // Фон карточек
    textOnPrimary: "#FFFFFF", // Текст на кнопках с акцентным цветом
  },
};

// Создаем контекст темы
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = useMemo(() => (isDarkMode ? themes.dark : themes.light), [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};