import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
} from "react-native";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ThemeContext } from "../config/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function GoalsScreen({ user }) {
  const [goals, setGoals] = useState([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalTargetMood, setNewGoalTargetMood] = useState(7);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    updateGoalsProgress();
  }, [goals]);

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

  const updateGoalsProgress = async () => {
    try {
      const moodsSnapshot = await getDocs(collection(db, "moods"));
      const moodData = moodsSnapshot.docs.map((doc) => doc.data());

      const updatedGoals = goals.map((goal) => {
        const matchingMoods = moodData.filter(
          (mood) => mood.mood >= goal.targetMood && mood.userId === user.uid
        );
        const progress =
          matchingMoods.length > 0
            ? Math.min(100, (matchingMoods.length / 10) * 100) // Ограничение 100%
            : 0;
        return { ...goal, progress };
      });

      updatedGoals.forEach(async (goal) => {
        await updateDoc(doc(db, "goals", goal.id), { progress: goal.progress });
      });

      setGoals(updatedGoals);
    } catch (error) {
      console.error("Error updating goals progress:", error.message);
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
      const savedGoal = { id: docRef.id, ...newGoal };
      setGoals((prevGoals) => [savedGoal, ...prevGoals]);
      Alert.alert("Success", "Goal added successfully!");
      setNewGoalTitle("");
      setNewGoalDescription("");
      setIsAddingGoal(false);
    } catch (error) {
      console.error("Error adding goal:", error.message);
    }
  };

  const openDeleteModal = (goalId) => {
    setSelectedGoal(goalId);
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDeleteModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.5,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

  const handleDeleteGoal = async () => {
    try {
      if (!selectedGoal) return;
      await deleteDoc(doc(db, "goals", selectedGoal));
      setGoals(goals.filter((goal) => goal.id !== selectedGoal));
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting goal:", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.appTitle, { color: theme.textOnPrimary }]}>
          MoodTracker
        </Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="person-circle-outline" size={30} color={theme.textOnPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.goalItem, { backgroundColor: theme.cardBackground }]}
            onPress={() => openDeleteModal(item.id)}
          >
            <Text style={[styles.goalTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.goalProgress, { color: theme.text }]}>
              Progress: {item.progress || 0}%
            </Text>
          </TouchableOpacity>
        )}
      />

      {!isAddingGoal && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setIsAddingGoal(true)}
        >
          <Text style={[styles.addButtonText, { color: theme.textOnPrimary }]}>
            Add New Goal
          </Text>
        </TouchableOpacity>
      )}

      {isAddingGoal && (
        <View style={styles.addGoalForm}>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="Goal Title"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
          />
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="Description"
            value={newGoalDescription}
            onChangeText={setNewGoalDescription}
          />
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="Target Mood (1-10)"
            keyboardType="numeric"
            value={String(newGoalTargetMood)}
            onChangeText={(value) => setNewGoalTargetMood(Number(value) || 0)}
          />
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={addGoal}
            >
              <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                Save Goal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.danger }]}
              onPress={() => setIsAddingGoal(false)}
            >
              <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal for Delete */}
      <Modal visible={modalVisible} transparent onRequestClose={closeDeleteModal}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.cardBackground,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={[styles.modalText, { color: theme.text }]}>
              Are you sure you want to delete this goal?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={closeDeleteModal}
              >
                <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "red" }]}
                onPress={handleDeleteGoal}
              >
                <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Profile Menu */}
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
  container: {
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  goalItem: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  goalProgress: {
    fontSize: 14,
  },
  addButton: {
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    position: "absolute",
    width: "80%",
    alignSelf: "center",
    bottom: 80,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addGoalForm: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 60,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    marginLeft: 5,
    backgroundColor: "red",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
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
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
});