import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export default function LoginScreen({ setUser }) {
  const { signInWithGoogle } = useGoogleAuth();

  const handleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      setUser(user);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={handleSignIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
});