import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { db } from "@/lib/firebase";

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  createdAt?: any;
};

type ChatWindowProps = {
  otherUserId: string;
};

export default function ChatWindow({ otherUserId }: ChatWindowProps) {
  const auth = getAuth();

  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsub();
  }, [auth]);

  const currentUserId = currentUser?.uid || "";

  const participants = useMemo(() => {
    if (!currentUserId || !otherUserId) return [];
    return [currentUserId, otherUserId].sort();
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    if (!currentUserId || !otherUserId || participants.length !== 2) {
      setLoadingChat(false);
      return;
    }

    const fixedChatId = participants.join("_");
    setChatId(fixedChatId);

    const createChatIfNeeded = async () => {
      try {
        setLoadingChat(true);

        const chatRef = doc(db, "chats", fixedChatId);
        const snap = await getDoc(chatRef);

        if (!snap.exists()) {
          await setDoc(chatRef, {
            participants,
            createdAt: serverTimestamp(),
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
          });
        } else {
          const data = snap.data();
          if (!Array.isArray(data?.participants)) {
            await setDoc(
              chatRef,
              {
                participants,
                lastMessageTime: serverTimestamp(),
              },
              { merge: true }
            );
          }
        }
      } catch (error) {
        console.error("Error creating/getting chat:", error);
      } finally {
        setLoadingChat(false);
      }
    };

    createChatIfNeeded();
  }, [currentUserId, otherUserId, participants]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...(docItem.data() as Omit<ChatMessage, "id">),
        }));

        setMessages(msgs);
      },
      (error) => {
        console.error("Error loading messages:", error);
      }
    );

    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !currentUser || !chatId) return;

    try {
      setSending(true);

      const messageText = text.trim();

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: messageText,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, "chats", chatId),
        {
          participants,
          lastMessage: messageText,
          lastMessageTime: serverTimestamp(),
        },
        { merge: true }
      );

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className="flex h-[78vh] items-center justify-center rounded-[30px] bg-[#0b1838] p-6">
        <p className="text-center text-xl text-gray-300">Please log in to use chat.</p>
      </div>
    );
  }

  if (!otherUserId) {
    return (
      <div className="flex h-[78vh] items-center justify-center rounded-[30px] bg-[#0b1838] p-6">
        <p className="text-center text-xl text-gray-300">No chat user selected.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[78vh] flex-col rounded-[30px] bg-[#0b1838] p-6">
      <div className="mb-3 text-sm text-gray-400 break-all">
        Chat ID: {chatId || "Loading..."}
      </div>

      <div className="flex-1 overflow-y-auto rounded-[24px] bg-[#101b3d] p-6">
        {loadingChat ? (
          <p className="text-center text-xl text-gray-300">Loading chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xl text-gray-300">No messages yet</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm md:text-base ${
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
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-full border-none bg-white px-5 py-4 text-black outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !sending) {
              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || !chatId || sending}
          className={`rounded-full px-8 py-4 font-semibold transition ${
            !text.trim() || !chatId || sending
              ? "cursor-not-allowed bg-gray-500 text-white"
              : "bg-cyan-400 text-black hover:bg-cyan-300"
          }`}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}