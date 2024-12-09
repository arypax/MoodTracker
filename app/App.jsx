import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import MoodInputScreen from "./screens/MoodInputScreen";
import HistoryScreen from "./screens/HistoryScreen";
import EditMoodScreen from "./screens/EditMoodScreen";
import ManageCategoriesScreen from "./screens/ManageCategoriesScreen";
import GoalsScreen from "./screens/GoalsScreen"; // Подключаем GoalsScreen

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
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
              children={(props) => <ManageCategoriesScreen {...props} user={user} />}
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