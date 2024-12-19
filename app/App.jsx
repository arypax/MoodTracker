import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./config/ThemeContext";
import AppNavigator from "./screens/AppNavigator";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator user={user} setUser={setUser} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}