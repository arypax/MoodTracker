import React, { useContext } from "react";
import { View, Button, StyleSheet } from "react-native";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { ThemeContext } from "../config/ThemeContext"; // Импорт контекста темы

export default function LoginScreen({ setUser }) {
  const { signInWithGoogle } = useGoogleAuth();
  const { theme } = useContext(ThemeContext); // Используем текущую тему

  const handleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      setUser(user);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Button
        title="Sign in with Google"
        onPress={handleSignIn}
        color={theme.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});