import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import MoodChart from "../components/MoodChart";
import { ThemeContext } from "../config/ThemeContext";

export default function HomeScreen({ user, navigation }) {
  const [moodData, setMoodData] = useState({ labels: [], values: [] });
  const { theme, toggleTheme, isDarkMode } = useContext(ThemeContext);

  const fetchMoodData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "moods"));
      const labels = [];
      const values = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        labels.push(data.date);
        values.push(data.mood);
      });
      setMoodData({ labels, values });
    } catch (error) {
      console.error("Error fetching mood data:", error);
    }
  };

  useEffect(() => {
    fetchMoodData();
  }, []);

  const calculateAverageMood = (values) => {
    if (values.length === 0) return "N/A";
    const sum = values.reduce((acc, value) => acc + value, 0);
    return (sum / values.length).toFixed(1);
  };

  const averageMood = calculateAverageMood(moodData.values);

  const getAdvice = (averageMood) => {
    if (averageMood < 4) {
      return "Try to relax and take a short walk.";
    } else if (averageMood >= 4 && averageMood <= 7) {
      return "Keep up the good work! How about some meditation?";
    } else {
      return "You're doing great! Maybe try a new hobby or spend time with friends.";
    }
  };

  const advice = getAdvice(averageMood);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }} // Убедитесь, что `ScrollView` занимает весь экран
      contentContainerStyle={{
        padding: 20, // Внутренний отступ
        flexGrow: 1, // Обеспечивает прокрутку, даже если содержимое меньше экрана
      }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}></Text>
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>
            {isDarkMode ? "Dark Mode" : "Light Mode"}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.primary }}
            thumbColor={isDarkMode ? theme.secondary : "#f4f3f4"}
          />
        </View>
      </View>

      <Text style={[styles.greetingText, { color: theme.text }]}>
        Welcome, {user.displayName}!
      </Text>
      <Text style={[styles.emailText, { color: theme.text }]}>Email: {user.email}</Text>

      <MoodChart data={moodData} />

      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: theme.text }]}>
          Average Mood: {averageMood}
        </Text>
      </View>

      <View style={[styles.adviceContainer, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.adviceTitle, { color: theme.text }]}>Today's Advice</Text>
        <Text style={[styles.adviceText, { color: theme.text }]}>{advice}</Text>
      </View>

      <View style={styles.buttonContainer}>
        {[
          { title: "Add Mood", route: "MoodInput" },
          { title: "View History", route: "History" },
          { title: "Manage Categories", route: "ManageCategories" },
          { title: "Set Goals", route: "Goals" },
        ].map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate(button.route)}
          >
            <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
              {button.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    marginBottom: 20,
  },
  statsContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  statsText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  adviceContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  adviceText: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});