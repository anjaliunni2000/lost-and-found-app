import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ChatList() {

  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigate = useNavigate();

  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {

    if (!userId) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId)
    );

    const unsub = onSnapshot(q, snap => {
      setChats(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();

  }, [userId]);

  return (
    <div className="p-10 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Your Chats
      </h1>

      {chats.length === 0 && (
        <p>No chats yet</p>
      )}

      {chats.map(chat => (
        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className="bg-black/40 p-4 rounded mb-3 cursor-pointer hover:bg-black/60"
        >
          <h2 className="font-semibold">
            {chat.itemName || "Item Chat"}
          </h2>
        </div>
      ))}

    </div>
  );
}
