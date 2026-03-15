import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

type ChatDoc = {
  participants?: string[];
  lastMessage?: string;
  lastMessageTime?: any;
};

export default function MessageIcon() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setUnread(false);
      return;
    }

    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(
      chatsQuery,
      (snapshot) => {
        const myChats = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...(docItem.data() as ChatDoc),
        }));

        setUnread(myChats.length > 0);
      },
      (error) => {
        console.error("Message icon load error:", error);
        setUnread(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  return (
    <div
      onClick={() => navigate("/chats")}
      className="fixed bottom-6 right-6 z-50 cursor-pointer"
      title="Open chats"
    >
      {unread && (
        <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-red-500"></span>
      )}

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 shadow-lg">
        <span className="text-xl text-black">💬</span>
      </div>
    </div>
  );
}