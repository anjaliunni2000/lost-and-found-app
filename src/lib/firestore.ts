import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

/* ================= USERS TABLE ================= */

// create user document
export const createUser = async (uid: string, name: string, email: string) => {
  await addDoc(collection(db, "users"), {
    uid,
    name,
    email,
    role: "user",
    createdAt: serverTimestamp(),
  });
};

/* ================= ITEMS TABLE ================= */

// add lost or found item
export const addItem = async (item: any) => {
  await addDoc(collection(db, "items"), {
    ...item,
    createdAt: serverTimestamp(),
  });
};

// get all items
export const getItems = async () => {
  const snapshot = await getDocs(collection(db, "items"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* ================= REPORTS TABLE ================= */

export const addReport = async (report: any) => {
  await addDoc(collection(db, "reports"), {
    ...report,
    reportDate: serverTimestamp(),
  });
};

/* ================= MATCHES TABLE ================= */

export const addMatch = async (
  lostItemId: string,
  foundItemId: string,
  score: number
) => {
  await addDoc(collection(db, "matches"), {
    lostItemId,
    foundItemId,
    similarityScore: score,
    matchStatus: "matched",
    createdAt: serverTimestamp(),
  });
};
