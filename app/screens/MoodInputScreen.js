import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Picker,
  Alert,
} from "react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { ThemeContext } from "../config/ThemeContext";

export default function MoodInputScreen({ user, navigation }) {
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState("");
  const [categories, setCategories] = useState(["Work", "Family", "Health"]);
  const [selectedCategory, setSelectedCategory] = useState("Work");
  const [date, setDate] = useState(new Date());
  const { theme } = useContext(ThemeContext); // Подключение темы

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Add Your Mood</Text>
      <Text style={[styles.label, { color: theme.text }]}>Mood (1-10):</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.secondary, color: theme.text },
        ]}
        keyboardType="numeric"
        value={String(mood)}
        onChangeText={(value) => setMood(Number(value))}
        placeholderTextColor={theme.placeholder}
      />

      <Text style={[styles.label, { color: theme.text }]}>Category:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={[
            styles.picker,
            { backgroundColor: theme.secondary, color: theme.text },
          ]}
        >
          {categories.map((category, index) => (
            <Picker.Item key={index} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Date:</Text>
      <DatePicker
        selected={date}
        onChange={(newDate) => setDate(newDate)}
        maxDate={new Date()}
        dateFormat="yyyy/MM/dd"
      />

      <Text style={[styles.label, { color: theme.text }]}>Note:</Text>
      <TextInput
        style={[
          styles.textArea,
          { backgroundColor: theme.secondary, color: theme.text },
        ]}
        multiline
        numberOfLines={4}
        placeholder="Add a note (optional)"
        value={note}
        onChangeText={setNote}
        placeholderTextColor={theme.placeholder}
      />

      <View style={styles.buttonContainer}>
        <Button title="Save Mood" onPress={saveMood} color={theme.primary} />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          color={theme.error}
        />
      </View>
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
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5,
  },
  picker: {
    width: "100%",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    textAlignVertical: "top",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});