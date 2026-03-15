import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyA0MAbBcK02N2VdpqiPaYgGW5rfy_zhd1s",
  authDomain: "lost-and-found-app-3bad6.firebaseapp.com",
  projectId: "lost-and-found-app-3bad6",
  storageBucket: "lost-and-found-app-3bad6.firebasestorage.app",
  messagingSenderId: "774841834382",
  appId: "1:774841834382:web:9ec80d2c1798bd6f4be2df",
  measurementId: "G-VH9WM1XVEC"
};

// Prevent duplicate Firebase initialization
export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable auth persistence safely
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence enabled");
  })
  .catch((err) => {
    console.error("Persistence error:", err);
  });