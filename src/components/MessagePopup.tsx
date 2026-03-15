import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where,  orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MessagePopup() {

  const { user } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState<any>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {

    if (!user) return;

   const q = query(
  collection(db, "chat_notifications"),
  where("receiverId", "==", user.uid),
  where("read", "==", false),
  orderBy("createdAt", "desc")
);

    const unsub = onSnapshot(q, (snapshot) => {

      if (snapshot.empty) return;

      const msg = snapshot.docs[snapshot.docs.length - 1];

      setMessage({
        id: msg.id,
        ...msg.data()
      });

      setVisible(true);

    });

    return () => unsub();

  }, [user]);

  if (!message || !visible) return null;

  return (

    <div className="fixed bottom-6 right-6 w-[320px] bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-slideUp">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">

        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
          📩 New Message
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ✕
        </button>

      </div>


      {/* MESSAGE BODY */}
      <div className="px-4 py-3">

        <p className="text-sm text-gray-300 mb-4">
          {message.text}
        </p>

        <div className="flex justify-between items-center">

          <button
            onClick={() => navigate(`/chat/${message.chatId}`)}
            className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Open Chat
          </button>

          <div className="bg-cyan-500 w-10 h-10 rounded-full flex items-center justify-center text-black">
            💬
          </div>

        </div>

      </div>

    </div>

  );

}