import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";

export default function AdminMatchApproval() {

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  function normalize(str: string) {
    return str?.toLowerCase().replace(/[_-]/g, " ").trim();
  }

  async function loadMatches() {
    try {

      const matchSnap = await getDocs(collection(db, "matches"));
      const itemSnap = await getDocs(collection(db, "items"));

      const items = itemSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      const merged = matchSnap.docs.map(m => {

        const matchData = m.data();

        // ⭐ MATCH BY itemId
        let itemData = items.find(
          (i: any) => i.id === matchData.itemId
        );

        // ⭐ FALLBACK NAME MATCH
        if (!itemData) {
          itemData = items.find((i: any) =>
            normalize(i.title || "").includes(
              normalize(matchData.itemName || "")
            )
          );
        }

        return {
          id: m.id,
          ...matchData,
          item: itemData || null
        };

      });

      setMatches(merged);

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  // ===============================
  // ⭐ APPROVE MATCH + CREATE CHAT
  // ===============================
  async function approveMatch(match: any) {

    try {

      // ⭐ 1. UPDATE MATCH STATUS
      await updateDoc(doc(db, "matches", match.id), {
        status: "approved"
      });

      // ⭐ 2. UPDATE ITEM STATUS → FOUND
      if (match.item?.id) {
        await updateDoc(doc(db, "items", match.item.id), {
          status: "found"
        });
      }

      // ⭐ 3. PREVENT DUPLICATE CHAT
      const chatQuery = query(
        collection(db, "chats"),
        where("itemId", "==", match.item?.id || "")
      );

      const existingChat = await getDocs(chatQuery);

      if (existingChat.empty) {

        // ⭐ 4. CREATE CHAT
        await addDoc(collection(db, "chats"), {
          participants: [
            match.userId || "",             // finder
            match.item?.userId || ""        // owner
          ],
          itemId: match.item?.id || "",
          itemName: match.itemName || "",
          createdAt: serverTimestamp()
        });

      }

      loadMatches();

    } catch (err) {
      console.log("Approve Error:", err);
    }
  }

  // ===============================
  // ⭐ REJECT MATCH
  // ===============================
  async function rejectMatch(id: string) {
    await updateDoc(doc(db, "matches", id), {
      status: "rejected"
    });
    loadMatches();
  }

  if (loading)
    return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="p-10 text-white">

      <h1 className="text-3xl font-bold mb-8">
        Admin Match Approval Panel
      </h1>

      {matches.map(match => {

        const item = match.item;

        return (
          <div
            key={match.id}
            className="bg-black/40 p-6 rounded-xl mb-6 flex gap-6"
          >

            {/* IMAGE */}
            <div className="w-48">
              {item?.image ? (
                <img
                  src={item.image}
                  className="rounded-xl w-full h-40 object-cover"
                />
              ) : (
                <div className="bg-gray-800 h-40 flex items-center justify-center rounded">
                  No Image
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div className="flex-1">

              <h2 className="text-xl font-bold mb-2">
                {item?.title || match.itemName}
              </h2>

              <p>📍 Location: {item?.location || "N/A"}</p>
              <p>📝 Description: {item?.description || "N/A"}</p>
              <p>📧 Email: {item?.contactEmail || "N/A"}</p>
              <p>📞 Phone: {item?.contactPhone || "N/A"}</p>

              <p className="mt-2">
                Confidence: {match.confidence || 0}%
              </p>

              <p>Status: {match.status || "pending"}</p>

              <div className="mt-4 flex gap-3">

                <button
                  onClick={() => approveMatch(match)}
                  className="bg-green-600 px-4 py-2 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectMatch(match.id)}
                  className="bg-red-600 px-4 py-2 rounded"
                >
                  Reject
                </button>

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}
