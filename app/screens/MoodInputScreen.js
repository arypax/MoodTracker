import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { ThemeContext } from "../config/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function MoodInputScreen({ user, navigation }) {
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState("");
  const [categories, setCategories] = useState(["Work", "Family", "Health"]);
  const [selectedCategory, setSelectedCategory] = useState("Work");
  const [date, setDate] = useState(new Date());
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const userCategories = [];
      querySnapshot.forEach((doc) => {
        userCategories.push(doc.data().name);
      });
      setCategories((prevCategories) => [
        ...new Set([...prevCategories, ...userCategories]),
      ]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const saveMood = async () => {
    try {
      await addDoc(collection(db, "moods"), {
        mood,
        note,
        category: selectedCategory,
        timestamp: date.toISOString(),
        userId: user.uid,
      });
      Alert.alert("Success", "Mood saved successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving mood:", error);
      Alert.alert("Error", "Failed to save mood. Please try again.");
    }
  };

  const refreshCategories = () => {
    fetchCategories();
    Alert.alert("Refreshed", "Categories updated successfully!");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.appTitle, { color: theme.textOnPrimary }]}>
          MoodTracker
        </Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons
            name="person-circle-outline"
            size={30}
            color={theme.textOnPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
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
          <View
            style={[styles.menuContainer, { backgroundColor: theme.cardBackground }]}
          >
            <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
              <Text style={{ color: theme.text }}>Switch Theme</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main Content */}
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Add Your Mood</Text>

        <Text style={[styles.label, { color: theme.text }]}>Mood (1-10):</Text>
        <View style={styles.moodButtonsContainer}>
          {[...Array(10)].map((_, index) => (
            <TouchableOpacity
              key={index + 1}
              style={[
                styles.moodButton,
                {
                  backgroundColor:
                    mood === index + 1 ? theme.primary : theme.secondary,
                },
              ]}
              onPress={() => setMood(index + 1)}
            >
              <Text
                style={{
                  color: mood === index + 1 ? theme.textOnPrimary : theme.text,
                  fontWeight: "bold",
                }}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Category:</Text>
        <View style={[styles.categoryContainer]}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selectedCategory === category ? theme.primary : theme.secondary,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    selectedCategory === category ? theme.textOnPrimary : theme.text,
                  fontWeight: "bold",
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Date:</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.secondary }]}
          onPress={() => setIsDatePickerOpen(true)}
        >
          <Text style={{ color: theme.text, fontWeight: "bold" }}>
            {date.toDateString()}
          </Text>
        </TouchableOpacity>

        {isDatePickerOpen && (
          <View style={styles.datePickerContainer}>
            <DatePicker
              selected={date}
              onChange={(newDate) => {
                setDate(newDate);
                setIsDatePickerOpen(false);
              }}
              inline
            />
          </View>
        )}

        <Text style={[styles.label, { color: theme.text }]}>Notes:</Text>
        <TextInput
          style={[styles.textArea, { borderColor: "#ff740f", color: theme.text }]}
          multiline
          numberOfLines={4}
          value={note}
          onChangeText={setNote}
          placeholder="Add your notes here..."
          placeholderTextColor={theme.text}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.roundButton, { backgroundColor: theme.primary }]}
            onPress={saveMood}
          >
            <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
              Save
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roundButton, { backgroundColor: "red" }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.primary }]}
          onPress={refreshCategories}
        >
          <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 20,
    width: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  moodButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
  },
  moodButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
    padding: 5,
    borderRadius: 10,
  },
  categoryButton: {
    margin: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  dateButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  datePickerContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  textArea: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roundButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  refreshButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingTop: 70,
    paddingRight: 10,
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