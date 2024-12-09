import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ThemeContext } from "../config/ThemeContext"; // Импорт контекста темы

export default function HistoryScreen({ user, navigation }) {
  const [moods, setMoods] = useState([]);
  const { theme } = useContext(ThemeContext); // Используем текущую тему

  useEffect(() => {
    const fetchMoods = async () => {
      if (!user || !user.uid) {
        console.error("User not authenticated!");
        return;
      }
      try {
        const q = query(
          collection(db, "moods"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedMoods = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMoods(fetchedMoods);
      } catch (error) {
        console.error("Error fetching moods:", error.message);
      }
    };

    fetchMoods();
  }, [user]);

  const handleEditMood = (item) => {
    navigation.navigate("EditMood", { mood: item });
  };

  const handleDeleteMood = async (id) => {
    try {
      await deleteDoc(doc(db, "moods", id)); // Удаление записи из Firestore
      setMoods(moods.filter((mood) => mood.id !== id)); // Удаление записи из локального состояния
      Alert.alert("Success", "Mood deleted successfully!");
    } catch (error) {
      console.error("Error deleting mood:", error.message);
      Alert.alert("Error", "Failed to delete mood.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Your Mood History</Text>
      {moods.length === 0 ? (
        <Text style={[styles.text, { color: theme.text }]}>No moods recorded yet.</Text>
      ) : (
        <FlatList
          data={moods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.item,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text style={[styles.date, { color: theme.text }]}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
              <Text style={[styles.mood, { color: theme.primary }]}>
                Mood: {item.mood}
              </Text>
              <Text style={[styles.category, { color: theme.text }]}>
                Category: {item.category || "No Category"}
              </Text>
              <Text style={[styles.note, { color: theme.text }]}>
                {item.note || "No Notes"}
              </Text>

              <View style={styles.buttonContainer}>
                <Button
                  title="Edit"
                  onPress={() => handleEditMood(item)}
                  color={theme.primary}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDeleteMood(item.id)}
                  color={theme.danger}
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
  item: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  date: {
    fontSize: 14,
  },
  mood: {
    fontSize: 18,
    fontWeight: "bold",
  },
  category: {
    fontSize: 16,
    fontStyle: "italic",
  },
  note: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});