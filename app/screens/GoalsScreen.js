import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export default function GoalsScreen({ user, navigation }) {
  const [goals, setGoals] = useState([]);
  const [moods, setMoods] = useState([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalTargetMood, setNewGoalTargetMood] = useState(7); // Целевое настроение
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Функция для получения целей из Firestore
  const fetchGoals = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "goals"));
      const fetchedGoals = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(fetchedGoals);
    } catch (error) {
      console.error("Error fetching goals:", error.message);
    }
  };

  // Функция для получения настроений из Firestore
  const fetchMoods = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "moods"));
      const fetchedMoods = querySnapshot.docs.map((doc) => doc.data());
      setMoods(fetchedMoods);
    } catch (error) {
      console.error("Error fetching moods:", error.message);
    }
  };

  // Функция для обновления прогресса целей
  const updateGoalProgress = async () => {
    try {
      const updatedGoals = goals.map(async (goal) => {
        const relevantMoods = moods.filter(
          (mood) => mood.userId === user.uid && mood.mood >= goal.targetMood
        );
        const progress = Math.min(
          (relevantMoods.length / 10) * 100, // Прогресс рассчитывается в процентах
          100
        );

        // Обновляем прогресс цели в Firestore
        const goalRef = doc(db, "goals", goal.id);
        await updateDoc(goalRef, { progress });

        return { ...goal, progress };
      });

      const resolvedGoals = await Promise.all(updatedGoals);
      setGoals(resolvedGoals);
    } catch (error) {
      console.error("Error updating goal progress:", error.message);
    }
  };

  // Функция для добавления новой цели
  const addGoal = async () => {
    if (!newGoalTitle || !newGoalTargetMood) {
      Alert.alert("Error", "Please provide a title and target mood.");
      return;
    }

    try {
      await addDoc(collection(db, "goals"), {
        title: newGoalTitle,
        description: newGoalDescription,
        targetMood: newGoalTargetMood,
        progress: 0,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Goal added successfully!");
      setNewGoalTitle("");
      setNewGoalDescription("");
      setNewGoalTargetMood(7);
      setIsAddingGoal(false);
      fetchGoals();
    } catch (error) {
      console.error("Error adding goal:", error.message);
      Alert.alert("Error", "Failed to add goal. Please try again.");
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchMoods();
  }, []);

  useEffect(() => {
    if (goals.length && moods.length) {
      updateGoalProgress();
    }
  }, [goals, moods]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Goals</Text>

      {/* Список целей */}
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.goalItem}
            onPress={() =>
              navigation.navigate("GoalDetails", { goal: item })
            }
          >
            <Text style={styles.goalTitle}>{item.title}</Text>
            <Text style={styles.goalProgress}>
              Progress: {item.progress}%
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Кнопка для отображения формы добавления цели */}
      {!isAddingGoal && (
        <Button
          title="Add New Goal"
          onPress={() => setIsAddingGoal(true)}
          color="#1E90FF"
        />
      )}

      {/* Форма для добавления новой цели */}
      {isAddingGoal && (
        <View style={styles.addGoalForm}>
          <TextInput
            style={styles.input}
            placeholder="Goal Title"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newGoalDescription}
            onChangeText={setNewGoalDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Target Mood (1-10)"
            keyboardType="numeric"
            value={String(newGoalTargetMood)}
            onChangeText={(value) =>
              setNewGoalTargetMood(Number(value) || 0)
            }
          />
          <View style={styles.buttonGroup}>
            <Button title="Save Goal" onPress={addGoal} color="#1E90FF" />
            <Button
              title="Cancel"
              onPress={() => setIsAddingGoal(false)}
              color="#FF6347"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  goalItem: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  goalProgress: {
    fontSize: 14,
    color: "#555",
  },
  addGoalForm: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});