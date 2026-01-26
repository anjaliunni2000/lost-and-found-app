import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0MAbBcK02N2VdpqiPaYgGW5rfy_zhd1s",
  authDomain: "lost-and-found-app-3bad6.firebaseapp.com",
  projectId: "lost-and-found-app-3bad6",
  storageBucket: "lost-and-found-app-3bad6.appspot.com",
  messagingSenderId: "774841834382",
  appId: "1:774841834382:web:9ec80d2c1798bd6f4be2df",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
