import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Send } from "lucide-react";

export default function ChatPage() {

  const { chatId } = useParams();
  const auth = getAuth();

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ⭐ WAIT FOR AUTH READY
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });

    return () => unsub();
  }, []);

  // ⭐ REALTIME MESSAGES
  useEffect(() => {

    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {

      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setMessages(data);

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    });

    return () => unsub();

  }, [chatId]);

  // ⭐ SEND MESSAGE
  async function sendMessage() {

    if (!text.trim()) return;
    if (!chatId) return alert("Chat not found");
    if (!userId) return alert("Login required");

    try {

      await addDoc(
        collection(db, "chats", chatId, "messages"),
        {
          senderId: userId,
          text,
          createdAt: serverTimestamp()
        }
      );

      setText("");

    } catch (err) {
      console.log("Send Error:", err);
      alert("Message send failed");
    }
  }

  // ⭐ FORMAT TIME
  function formatTime(ts: any) {
    if (!ts?.seconds) return "";
    return new Date(ts.seconds * 1000)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="h-screen flex flex-col bg-[#0B141A] text-white">

      {/* HEADER */}
      <div className="bg-[#202C33] p-4 shadow-md flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-bold">
          C
        </div>
        <div>
          <p className="font-semibold">Chat</p>
          <p className="text-xs text-gray-400">Online</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map(msg => {

          const isMe = msg.senderId === userId;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >

              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  isMe ? "bg-[#005C4B]" : "bg-[#202C33]"
                }`}
              >

                <p className="text-sm">{msg.text}</p>

                <span className="text-[10px] text-gray-300 block text-right mt-1">
                  {formatTime(msg.createdAt)}
                </span>

              </div>

            </div>
          );
        })}

        <div ref={bottomRef} />

      </div>

      {/* INPUT */}
      <div className="bg-[#202C33] p-3 flex gap-2">

        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message"
          className="flex-1 bg-[#2A3942] px-4 py-2 rounded-full outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-green-500 p-3 rounded-full"
        >
          <Send size={18}/>
        </button>

      </div>

    </div>
  );
}
