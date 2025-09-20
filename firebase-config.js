// Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "", // Add your Firebase API key here
  authDomain: "study-tracker-9147f.firebaseapp.com",
  projectId: "study-tracker-9147f",
  storageBucket: "study-tracker-9147f.firebasestorage.app",
  messagingSenderId: "496738121820",
  appId: "1:496738121820:web:f7bbc1d96ea4813f3f4e99",
  measurementId: "G-Z1B8VMTKYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
