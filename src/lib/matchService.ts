import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function checkForMatches(newItem: any) {
  try {
    const snapshot = await getDocs(collection(db, "items"));

    const otherItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const oppositeStatus =
      newItem.status === "lost" ? "found" : "lost";

    const matches = otherItems.filter((item: any) =>
      item.status === oppositeStatus &&
      item.category === newItem.category &&
      item.location === newItem.location
    );

    for (const match of matches as any[]) {
      await addDoc(collection(db, "matches"), {
        lostItemId:
          newItem.status === "lost" ? newItem.id : match.id,

        foundItemId:
          newItem.status === "found" ? newItem.id : match.id,

        similarityScore: 0.9,
        matchStatus: "matched",
        createdAt: new Date()
      });
    }

  } catch (error) {
    console.log("MATCH ERROR:", error);
  }
}
