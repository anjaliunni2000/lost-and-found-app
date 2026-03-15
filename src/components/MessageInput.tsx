import { useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";

type MessageInputProps = {
  chatId: string;
};

export default function MessageInput({ chatId }: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const user = getAuth().currentUser;

  const handleSend = async () => {
    if (!chatId || !user || !text.trim()) return;

    try {
      setSending(true);

      const messageText = text.trim();

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: messageText,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        await updateDoc(chatRef, {
          lastMessage: messageText,
          lastMessageTime: serverTimestamp(),
        });
      }

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-3 rounded-full bg-white text-black outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />

      <button
        onClick={handleSend}
        disabled={!text.trim() || !chatId || sending}
        className={`px-6 py-3 rounded-full font-semibold transition ${
          !text.trim() || !chatId || sending
            ? "bg-gray-500 cursor-not-allowed text-white"
            : "bg-cyan-400 hover:bg-cyan-300 text-black"
        }`}
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}