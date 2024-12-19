import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import { ThemeContext } from "../config/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen";
import MoodInputScreen from "./MoodInputScreen";
import HistoryScreen from "./HistoryScreen";
import ManageCategoriesScreen from "./ManageCategoriesScreen";
import GoalsScreen from "./GoalsScreen";
import EditMoodScreen from "./EditMoodScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs({ user }) {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "Add Mood") {
            iconName = "add-circle-outline";
          } else if (route.name === "History") {
            iconName = "time-outline";
          } else if (route.name === "Categories") {
            iconName = "list-outline";
          } else if (route.name === "Goals") {
            iconName = "flag-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.textOnPrimary,
        tabBarInactiveTintColor: "#fbd9b1",
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: theme.primary },
        ],
        tabBarBackground: () => (
          <View style={[styles.tabBarBackground, { backgroundColor: theme.primary }]} />
        ),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Add Mood">
        {(props) => <MoodInputScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="History">
        {(props) => <HistoryScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Categories">
        {(props) => <ManageCategoriesScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Goals">
        {(props) => <GoalsScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user, setUser }) {
  const { theme } = useContext(ThemeContext);

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack.Navigator
          initialRouteName={user ? "HomeTabs" : "Login"}
          screenOptions={{
            headerShown: false,
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="HomeTabs">
                {(props) => <HomeTabs {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="EditMood"
                children={(props) => <EditMoodScreen {...props} />}
              />
            </>
          ) : (
            <Stack.Screen
              name="Login"
              children={(props) => <LoginScreen {...props} setUser={setUser} />}
            />
          )}
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    height: 65,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  tabBarBackground: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
