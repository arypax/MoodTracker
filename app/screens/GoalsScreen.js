import React, { useEffect, useState, useContext } from "react";
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
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ThemeContext } from "../config/ThemeContext"; // Импорт контекста темы

export default function GoalsScreen({ user, navigation }) {
  const [goals, setGoals] = useState([]);
  const [moods, setMoods] = useState([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalTargetMood, setNewGoalTargetMood] = useState(7); // Целевое настроение
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null); // Состояние для выбранной цели

  const { theme } = useContext(ThemeContext); // Получение текущей темы

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

  const fetchMoods = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "moods"));
      const fetchedMoods = querySnapshot.docs.map((doc) => doc.data());
      setMoods(fetchedMoods);
    } catch (error) {
      console.error("Error fetching moods:", error.message);
    }
  };

  const updateGoalProgress = async (updatedGoals) => {
    try {
      const newGoals = await Promise.all(
        updatedGoals.map(async (goal) => {
          const relevantMoods = moods.filter(
            (mood) => mood.userId === user.uid && mood.mood >= goal.targetMood
          );
          const progress = Math.min(
            (relevantMoods.length / 10) * 100, // Прогресс рассчитывается в процентах
            100
          );

          const goalRef = doc(db, "goals", goal.id);
          await updateDoc(goalRef, { progress });

          return { ...goal, progress };
        })
      );
      setGoals(newGoals);
    } catch (error) {
      console.error("Error updating goal progress:", error.message);
    }
  };

  const addGoal = async () => {
    if (!newGoalTitle || !newGoalTargetMood) {
      Alert.alert("Error", "Please provide a title and target mood.");
      return;
    }

    try {
      const newGoal = {
        title: newGoalTitle,
        description: newGoalDescription,
        targetMood: newGoalTargetMood,
        progress: 0,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "goals"), newGoal);
      setGoals((prevGoals) => [
        { id: docRef.id, ...newGoal },
        ...prevGoals, // Добавляем новый элемент в начало
      ]);
      Alert.alert("Success", "Goal added successfully!");
      setNewGoalTitle("");
      setNewGoalDescription("");
      setNewGoalTargetMood(7);
      setIsAddingGoal(false);
    } catch (error) {
      console.error("Error adding goal:", error.message);
      Alert.alert("Error", "Failed to add goal. Please try again.");
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await deleteDoc(doc(db, "goals", id));
      setGoals(goals.filter((goal) => goal.id !== id)); // Удаляем цель из локального состояния
      Alert.alert("Success", "Goal deleted successfully!");
      setSelectedGoal(null); // Сброс выбранной цели
    } catch (error) {
      console.error("Error deleting goal:", error.message);
      Alert.alert("Error", "Failed to delete goal.");
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchMoods();
  }, []);

  useEffect(() => {
    if (goals.length && moods.length) {
      updateGoalProgress(goals);
    }
  }, [moods]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Your Goals</Text>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.goalItem,
              { backgroundColor: theme.cardBackground },
            ]}
            onPress={() => setSelectedGoal(item)}
          >
            <Text style={[styles.goalTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.goalProgress, { color: theme.text }]}>
              Progress: {item.progress}%
            </Text>

            {selectedGoal?.id === item.id && (
              <Button
                title="Delete"
                onPress={() => handleDeleteGoal(item.id)}
                color={theme.danger}
              />
            )}
          </TouchableOpacity>
        )}
      />

      {!isAddingGoal && (
        <Button
          title="Add New Goal"
          onPress={() => setIsAddingGoal(true)}
          color={theme.primary}
        />
      )}

      {isAddingGoal && (
        <View
          style={[
            styles.addGoalForm,
            { backgroundColor: theme.formBackground },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
            placeholder="Goal Title"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
          />
          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
            placeholder="Description"
            value={newGoalDescription}
            onChangeText={setNewGoalDescription}
          />
          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
            placeholder="Target Mood (1-10)"
            keyboardType="numeric"
            value={String(newGoalTargetMood)}
            onChangeText={(value) =>
              setNewGoalTargetMood(Number(value) || 0)
            }
          />
          <View style={styles.buttonGroup}>
            <Button title="Save Goal" onPress={addGoal} color={theme.primary} />
            <Button
              title="Cancel"
              onPress={() => setIsAddingGoal(false)}
              color={theme.danger}
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  goalItem: {
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
  },
  addGoalForm: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});