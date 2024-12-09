import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { ThemeContext } from "../config/ThemeContext"; // Подключаем контекст темы

export default function ManageCategoriesScreen({ user }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const { theme } = useContext(ThemeContext); // Используем текущую тему

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const userCategories = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === user.uid) {
          userCategories.push({ id: doc.id, name: data.name });
        }
      });
      setCategories(userCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Add new category
  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await addDoc(collection(db, "categories"), {
        userId: user.uid,
        name: newCategory.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewCategory("");
      fetchCategories(); // Refresh categories
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      fetchCategories(); // Refresh categories
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Manage Categories</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.secondary, color: theme.text }]}
        placeholder="New category name"
        placeholderTextColor={theme.placeholder}
        value={newCategory}
        onChangeText={setNewCategory}
      />
      <Button title="Add Category" onPress={addCategory} color={theme.primary} />

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.categoryContainer, { borderBottomColor: theme.border }]}>
            <Text style={[styles.categoryText, { color: theme.text }]}>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteCategory(item.id)}>
              <Text style={[styles.deleteText, { color: theme.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
  },
  categoryText: {
    fontSize: 16,
  },
  deleteText: {
    fontSize: 16,
  },
});