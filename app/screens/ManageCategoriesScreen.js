import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from "react-native";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { ThemeContext } from "../config/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ManageCategoriesScreen({ user }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [menuVisible, setMenuVisible] = useState(false);

  const { theme, toggleTheme } = useContext(ThemeContext);

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

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addDoc(collection(db, "categories"), {
        userId: user.uid,
        name: newCategory.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const openDeleteModal = (id) => {
    setSelectedCategoryId(id);
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

  const handleDeleteCategory = async () => {
    try {
      if (!selectedCategoryId) return;
      await deleteDoc(doc(db, "categories", selectedCategoryId));
      setCategories(categories.filter((cat) => cat.id !== selectedCategoryId));
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.appTitle, { color: theme.textOnPrimary }]}>
          Manage Categories
        </Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons
            name="person-circle-outline"
            size={35}
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
          style={styles.menuOverlay}
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
        <TextInput
          style={[styles.input, { backgroundColor: theme.secondary, color: theme.text }]}
          placeholder="New category name"
          placeholderTextColor={theme.placeholder}
          value={newCategory}
          onChangeText={setNewCategory}
        />
        <TouchableOpacity
          style={[styles.roundButton, { backgroundColor: theme.primary }]}
          onPress={addCategory}
        >
          <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
            Add Category
          </Text>
        </TouchableOpacity>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.categoryContainer,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text style={[styles.categoryText, { color: theme.text }]}>
                {item.name}
              </Text>
              <TouchableOpacity onPress={() => openDeleteModal(item.id)}>
                <Text style={[styles.deleteText, { color: "red" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Delete Confirmation Modal */}
      <Modal visible={modalVisible} transparent onRequestClose={closeDeleteModal}>
        <Animated.View style={[styles.deleteModalOverlay, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.cardBackground, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={[styles.modalText, { color: theme.text }]}>
              Are you sure you want to delete this category?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: theme.primary }]}
                onPress={closeDeleteModal}
              >
                <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: "red" }]}
                onPress={handleDeleteCategory}
              >
                <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
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
    paddingVertical: 10,
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
  input: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    height: 50,
    borderWidth: 1,
    borderColor: "#ff740f",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteModalOverlay: {
    flex: 1,
    justifyContent: "center", // Центрирование по вертикали
    alignItems: "center",     // Центрирование по горизонтали
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    borderRadius: 10,
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  roundButton: {
    marginTop: 15,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  menuOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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