import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt?: any;
};

type ChatType = {
  id: string;
  participants?: string[];
  lastMessage?: string;
  lastMessageTime?: any;
};

export default function Chats() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const currentUserId = currentUser?.uid || "";

  const selectedChat = useMemo(() => {
    return chats.find((chat) => chat.id === selectedChatId) || null;
  }, [chats, selectedChatId]);

  useEffect(() => {
    if (!currentUserId) {
      setChats([]);
      setSelectedChatId("");
      return;
    }

    const chatsRef = collection(db, "chats");
    const chatsQuery = query(
      chatsRef,
      where("participants", "array-contains", currentUserId)
    );

    const unsub = onSnapshot(
      chatsQuery,
      (snapshot) => {
        const myChats: ChatType[] = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...(docItem.data() as Omit<ChatType, "id">),
        }));

        myChats.sort((a, b) => {
          const aTime = a.lastMessageTime?.seconds || 0;
          const bTime = b.lastMessageTime?.seconds || 0;
          return bTime - aTime;
        });

        setChats(myChats);

        setSelectedChatId((prev) => {
          if (prev && myChats.some((chat) => chat.id === prev)) {
            return prev;
          }
          return myChats.length > 0 ? myChats[0].id : "";
        });
      },
      (error) => {
        console.error("Chats load error:", error);
      }
    );

    return () => unsub();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedChat?.id) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, "chats", selectedChat.id, "messages");
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...(docItem.data() as Omit<Message, "id">),
        }));
        setMessages(msgs);
      },
      (error) => {
        console.error("Messages load error:", error);
      }
    );

    return () => unsub();
  }, [selectedChat?.id]);

  const sendMessage = async () => {
    if (!currentUser || !selectedChat?.id || !text.trim()) return;

    try {
      setSending(true);
      const messageText = text.trim();

      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        text: messageText,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, "chats", selectedChat.id),
        {
          lastMessage: messageText,
          lastMessageTime: serverTimestamp(),
          participants: Array.isArray(selectedChat.participants)
            ? selectedChat.participants
            : [currentUser.uid],
        },
        { merge: true }
      );

      setText("");
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setSending(false);
    }
  };

  const getOtherUserId = (chat: ChatType) => {
    if (!Array.isArray(chat.participants)) return "Unknown user";
    return chat.participants.find((id) => id !== currentUserId) || "Unknown user";
  };

  return (
    <div className="min-h-screen bg-[#020b24] px-6 py-8 text-white">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-slate-700 px-5 py-3 text-white font-medium hover:bg-slate-600 transition"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-bold">Chats</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-[#0b1838] p-4">
          <h2 className="mb-4 text-xl font-semibold">Your Chats</h2>

          {chats.length === 0 ? (
            <p className="text-gray-300">No chats available</p>
          ) : (
            <div className="space-y-3">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedChatId === chat.id
                      ? "border-cyan-300 bg-cyan-500 text-black"
                      : "border-transparent bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                >
                  <p className="font-semibold break-all">
                    User: {getOtherUserId(chat)}
                  </p>
                  <p className="mt-1 text-sm opacity-80 break-all">
                    {chat.lastMessage || "No messages yet"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 rounded-3xl bg-[#0b1838] p-6 flex flex-col h-[75vh]">
          <div className="mb-4">
            {selectedChat && (
              <p className="text-sm text-cyan-300 break-all">
                Chatting with: {getOtherUserId(selectedChat)}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl bg-[#101b3d] p-4">
            {!selectedChat ? (
              <p className="mt-10 text-center text-gray-300">
                Select a chat to start messaging
              </p>
            ) : messages.length === 0 ? (
              <p className="mt-10 text-center text-gray-300">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUserId;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 break-words ${
                          isMine
                            ? "bg-cyan-400 text-black"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              disabled={!selectedChat}
              className="flex-1 rounded-full bg-white px-5 py-4 text-black outline-none disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!selectedChat || !text.trim() || sending}
              className={`rounded-full px-8 py-4 font-semibold transition ${
                !selectedChat || !text.trim() || sending
                  ? "cursor-not-allowed bg-gray-500 text-white"
                  : "bg-emerald-500 text-white hover:bg-emerald-400"
              }`}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}