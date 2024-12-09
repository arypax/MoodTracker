import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSrhZY9VmevOTSQ8xamSISMm5XpQ9A56w",
  authDomain: "moodtracker-37030.firebaseapp.com",
  projectId: "moodtracker-37030",
  storageBucket: "moodtracker-37030.firebasestorage.app",
  messagingSenderId: "114711137129",
  appId: "1:114711137129:web:3601c61d80600d3d5d0bf8",
  measurementId: "G-798YQSCZJX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // Firestore instance

export { auth, provider, signInWithPopup, db };