import React, { useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import MoodInputScreen from "./screens/MoodInputScreen";
import HistoryScreen from "./screens/HistoryScreen";
import EditMoodScreen from "./screens/EditMoodScreen";
import ManageCategoriesScreen from "./screens/ManageCategoriesScreen";
import GoalsScreen from "./screens/GoalsScreen";
import { ThemeProvider, ThemeContext } from "./config/ThemeContext"; // Импортируем тему

const Stack = createStackNavigator();

function AppNavigator({ user, setUser }) {
  const { theme } = useContext(ThemeContext); // Используем тему из контекста

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              options={{ title: "Home" }}
              children={(props) => <HomeScreen {...props} user={user} />}
            />
            <Stack.Screen
              name="MoodInput"
              options={{ title: "Add Mood" }}
              children={(props) => <MoodInputScreen {...props} user={user} />}
            />
            <Stack.Screen
              name="History"
              options={{ title: "Mood History" }}
              children={(props) => <HistoryScreen {...props} user={user} />}
            />
            <Stack.Screen
              name="EditMood"
              options={{ title: "Edit Mood" }}
              children={(props) => <EditMoodScreen {...props} />}
            />
            <Stack.Screen
              name="ManageCategories"
              options={{ title: "Manage Categories" }}
              children={(props) => (
                <ManageCategoriesScreen {...props} user={user} />
              )}
            />
            <Stack.Screen
              name="Goals"
              options={{ title: "Your Goals" }}
              children={(props) => <GoalsScreen {...props} user={user} />}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            options={{ title: "Login" }}
            children={(props) => <LoginScreen {...props} setUser={setUser} />}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <ThemeProvider>
      <AppNavigator user={user} setUser={setUser} />
    </ThemeProvider>
  );
}