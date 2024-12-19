import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../config/firebase";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { ThemeContext } from "../config/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function EditMoodScreen({ route, navigation }) {
  const { mood } = route.params;
  const [moodLevel, setMoodLevel] = useState(mood.mood || 5);
  const [selectedCategory, setSelectedCategory] = useState(mood.category || "Work");
  const [categories, setCategories] = useState(["Work", "Family", "Health"]);
  const [date, setDate] = useState(new Date(mood.timestamp));
  const [note, setNote] = useState(mood.note || "");
  const [menuVisible, setMenuVisible] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { theme, toggleTheme } = useContext(ThemeContext);

  // Получение категорий из базы данных
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
      console.error("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    try {
      const moodRef = doc(db, "moods", mood.id);
      await updateDoc(moodRef, {
        mood: moodLevel,
        timestamp: date.toISOString(),
        category: selectedCategory,
        note: note,
      });
      Alert.alert("Success", "Mood updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating mood:", error.message);
      Alert.alert("Error", "Failed to update mood. Please try again.");
    }
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
        <Text style={[styles.title, { color: theme.text }]}>Edit Your Mood</Text>

        <Text style={[styles.label, { color: theme.text }]}>Mood (1-10):</Text>
        <View style={styles.moodButtonsContainer}>
          {[...Array(10)].map((_, index) => (
            <TouchableOpacity
              key={index + 1}
              style={[
                styles.moodButton,
                {
                  backgroundColor:
                    moodLevel === index + 1 ? theme.primary : theme.secondary,
                },
              ]}
              onPress={() => setMoodLevel(index + 1)}
            >
              <Text
                style={{
                  color: moodLevel === index + 1 ? theme.textOnPrimary : theme.text,
                  fontWeight: "bold",
                }}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Category:</Text>
<View style={[styles.dropdown]}>
  {categories.map((category) => (
    <TouchableOpacity
      key={category}
      onPress={() => setSelectedCategory(category)}
      style={[
        styles.categoryButton, // Применяем стиль
        {
          backgroundColor:
            category === selectedCategory ? theme.primary : theme.secondary,
          borderColor:
            category === selectedCategory ? theme.primary : theme.border,
        },
      ]}
    >
      <Text
        style={{
          color: category === selectedCategory ? theme.textOnPrimary : theme.text,
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
          style={[styles.textArea, { borderColor: theme.border, color: theme.text }]}
          multiline
          numberOfLines={4}
          value={note}
          onChangeText={setNote}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.roundButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
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
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5, // Отступы между кнопками
    borderRadius: 20, // Скруглённые углы
    borderWidth: 1, // Граница для выделения
    alignItems: "center", // Центрирование текста по горизонтали
    justifyContent: "center", // Центрирование текста по вертикали
  },
  dateButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    textAlign: "center",
  },
  datePickerContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  textArea:{
    width: "100%",
    height: 100,
    borderWidth: 2,
    borderColor: "#FF740F",
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
    paddingHorizontal: 10,
    textAlignVertical: "top",
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
