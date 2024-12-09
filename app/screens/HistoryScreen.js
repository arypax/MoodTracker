import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

export default function HistoryScreen({ user, navigation }) {
  const [moods, setMoods] = useState([]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Mood History</Text>
      {moods.length === 0 ? (
        <Text style={styles.text}>No moods recorded yet.</Text>
      ) : (
        <FlatList
          data={moods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onLongPress={() => handleEditMood(item)}
            >
              <Text style={styles.date}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.mood}>Mood: {item.mood}</Text>
              <Text style={styles.category}>
                Category: {item.category || "No Category"}
              </Text>
              <Text style={styles.note}>{item.note || "No Notes"}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  date: {
    fontSize: 14,
    color: "#555",
  },
  mood: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E90FF",
  },
  category: {
    fontSize: 16,
    color: "#555",
    fontStyle: "italic",
  },
  note: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
});