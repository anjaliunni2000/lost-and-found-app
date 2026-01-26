
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function createNotification(
  userId: string,
  message: string,
  confidence: number
) {
  await addDoc(collection(db, "notifications"), {
    userId,
    message,
    confidence,
    read: false,
    createdAt: serverTimestamp(),
  });
}
