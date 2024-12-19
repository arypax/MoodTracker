import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import MoodChart from "../components/MoodChart";
import { ThemeContext } from "../config/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function HomeScreen({ user, navigation }) {
  const [moodData, setMoodData] = useState({ labels: [], values: [] });
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchMoodData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "moods"));
      const labels = [];
      const values = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        labels.push(data.date ? data.date : "");
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

  const refreshData = () => {
    fetchMoodData(); // Обновляем данные
    Alert.alert("Data Refreshed", "Mood data has been refreshed successfully!");
  };

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

  const handleLogout = () => {
    setMenuVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Верхняя панель */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.appTitle, { color: theme.textOnPrimary }]}>
          MoodTracker
        </Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="person-circle-outline" size={30} color={theme.textOnPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
        <Text style={[styles.greetingText, { color: theme.text }]}>
          Welcome, {user.displayName}!
        </Text>
        <Text style={[styles.emailText, { color: theme.text }]}>
          Email: {user.email}
        </Text>

        <MoodChart data={moodData} />

        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: theme.text }]}>
            Average Mood: {averageMood}
          </Text>
        </View>

        <View
          style={[styles.adviceContainer, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.adviceTitle, { color: theme.text }]}>Today's Advice</Text>
          <Text style={[styles.adviceText, { color: theme.text }]}>{advice}</Text>
        </View>

        {/* Кнопка обновления */}
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.primary }]}
          onPress={refreshData}
        >
          <Text style={[styles.refreshButtonText, { color: theme.textOnPrimary }]}>
            Refresh
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Меню */}
      <Modal
        transparent
        animationType="fade"
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: theme.cardBackground }]}>
            <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
              <Text style={{ color: theme.text }}>Switch Theme</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center",
  },
  emailText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
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
  refreshButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    alignSelf: "center",
    elevation: 5,
  },
  refreshButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  menuContainer: {
    width: 200,
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});