import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Picker,
  Alert,
} from "react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../config/firebase";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";

export default function EditMoodScreen({ route, navigation }) {
  const { mood } = route.params;
  const [newMood, setNewMood] = useState(mood.mood);
  const [newDate, setNewDate] = useState(new Date(mood.timestamp));
  const [newCategory, setNewCategory] = useState(mood.category || "General");
  const [newNote, setNewNote] = useState(mood.note || "");
  const [categories, setCategories] = useState(["Work", "Family", "Health"]);

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
        mood: newMood,
        timestamp: newDate.toISOString(),
        category: newCategory,
        note: newNote,
      });
      Alert.alert("Success", "Mood updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating mood:", error.message);
      Alert.alert("Error", "Failed to update mood. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Your Mood</Text>
      <Text style={styles.label}>Mood Level:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(newMood)}
        onChangeText={(value) => setNewMood(Number(value))}
      />

      <Text style={styles.label}>Category:</Text>
      <Picker
        selectedValue={newCategory}
        onValueChange={(itemValue) => setNewCategory(itemValue)}
        style={styles.picker}
      >
        {categories.map((category, index) => (
          <Picker.Item key={index} label={category} value={category} />
        ))}
      </Picker>

      <Text style={styles.label}>Date:</Text>
      <DatePicker
        selected={newDate}
        onChange={(date) => setNewDate(date)}
        maxDate={new Date()}
        dateFormat="yyyy/MM/dd"
      />

      <Text style={styles.label}>Notes:</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        value={newNote}
        onChangeText={setNewNote}
      />
      <Button title="Save Changes" onPress={handleSave} color="#1E90FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  label: {
    fontSize: 16,
    marginTop: 10,
    color: "#555",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  picker: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  textArea: {
    width: "100%",
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    textAlignVertical: "top",
  },
});