import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import MoodChart from "../components/MoodChart";

export default function HomeScreen({ user, navigation }) {
  const [moodData, setMoodData] = useState({ labels: [], values: [] });

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greetingText}>Welcome, {user.displayName}!</Text>
      <Text style={styles.emailText}>Email: {user.email}</Text>

      <MoodChart data={moodData} />

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Average Mood: {averageMood}</Text>
      </View>

      <View style={styles.adviceContainer}>
        <Text style={styles.adviceTitle}>Today's Advice</Text>
        <Text style={styles.adviceText}>{advice}</Text>
      </View>

      <Button
        title="Add Mood"
        onPress={() => navigation.navigate("MoodInput")}
        color="#1E90FF"
      />
      <Button
        title="View History"
        onPress={() => navigation.navigate("History")}
        color="#1E90FF"
      />
      <Button
        title="Manage Categories"
        onPress={() => navigation.navigate("ManageCategories")}
        color="#1E90FF"
      />
      <Button
        title="Set Goals"
        onPress={() => navigation.navigate("Goals")}
        color="#1E90FF"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  statsContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  statsText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  adviceContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f8ff",
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
    color: "#555",
    textAlign: "center",
  },
});