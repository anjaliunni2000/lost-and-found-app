import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

interface Props {
  chatId: string;
  userId: string;
}

const UserChatBox = ({ chatId, userId }: Props) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => data.push(doc.data()));
      setMessages(data);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: message,
      senderId: userId,
      timestamp: Date.now(),
    });

    setMessage("");
  };

  return (
    <div className="bg-card p-4 rounded-xl w-full max-w-md">

      <div className="h-64 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <span className="text-sm text-primary">
              {msg.senderId === userId ? "You" : "User"}:
            </span>
            <p className="text-muted-foreground">{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />

        <button
          onClick={sendMessage}
          className="bg-primary px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default UserChatBox;