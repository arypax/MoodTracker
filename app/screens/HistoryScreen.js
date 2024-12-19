import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ThemeContext } from "../config/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function HistoryScreen({ user, navigation }) {
  const [moods, setMoods] = useState([]);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMoodId, setSelectedMoodId] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  const fetchMoods = async () => {
    if (!user || !user.uid) return;
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

  useEffect(() => {
    fetchMoods();
  }, [user]);

  const handleEditMood = (item) => {
    navigation.navigate("EditMood", { mood: item });
  };

  const openDeleteModal = (id) => {
    setSelectedMoodId(id);
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

  const handleDeleteMood = async () => {
    if (!selectedMoodId) return;
    try {
      await deleteDoc(doc(db, "moods", selectedMoodId));
      setMoods(moods.filter((mood) => mood.id !== selectedMoodId));
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting mood:", error.message);
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

      {/* Content */}
      <Text style={[styles.title, { color: theme.text }]}>Your Mood History</Text>
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: theme.primary }]}
        onPress={fetchMoods}
      >
        <Text style={[styles.refreshButtonText, { color: theme.textOnPrimary }]}>
          Refresh
        </Text>
      </TouchableOpacity>
      {moods.length === 0 ? (
        <Text style={[styles.text, { color: theme.text }]}>No moods recorded yet.</Text>
      ) : (
        <FlatList
          data={moods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.item, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.date, { color: theme.text }]}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
              <Text style={[styles.mood, { color: theme.primary }]}>Mood: {item.mood}</Text>
              <Text style={[styles.category, { color: theme.text }]}>
                Category: {item.category || "No Category"}
              </Text>
              <Text style={[styles.note, { color: theme.text }]}>{item.note || "No Notes"}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primary }]}
                  onPress={() => handleEditMood(item)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "red" }]}
                  onPress={() => openDeleteModal(item.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Delete Modal */}
      <Modal visible={modalVisible} transparent onRequestClose={closeDeleteModal}>
        <Animated.View style={[styles.modalOverlayCentered, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.cardBackground, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={[styles.modalText, { color: theme.text }]}>
              Are you sure you want to delete this mood?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={closeDeleteModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "red" }]}
                onPress={handleDeleteMood}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
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
    height: 60,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
  },
  refreshButton: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 20,
    alignSelf: "center",
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    textAlign: "center",
  },
  item: {
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalOverlayCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
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