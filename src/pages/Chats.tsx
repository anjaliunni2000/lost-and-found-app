import { useEffect, useState, useRef, useMemo } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  getDoc,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { db } from "@/lib/firebase";
import { Search, MoreVertical, Send, CheckCheck, User, ArrowLeft, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  status?: "pending" | "accepted";
  initiatorId?: string;
};

export default function Chats() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const { chatId: urlChatId, userId: urlUserId } = useParams();
  const location = useLocation();

  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUser?.uid || "";

  // 1. Establish selected chat based on URL parameter (either /chat/:chatId, /chat/:userId, or /chats)
  const initialMount = useRef(true);

  useEffect(() => {
    if (!currentUserId) return;

    if (initialMount.current) {
      initialMount.current = false;
      if (urlChatId) {
        setSelectedChatId(urlChatId);
      } else if (urlUserId) {
        // If they navigate via /chat/user_id, construct the deterministic chat ID
        const participants = [currentUserId, urlUserId].sort();
        setSelectedChatId(participants.join("_"));
      }
    }
  }, [urlChatId, urlUserId, currentUserId]);

  const selectedChat = useMemo(() => {
    return chats.find((chat) => chat.id === selectedChatId) || null;
  }, [chats, selectedChatId]);

  // 2. Load all chats for sidebar
  useEffect(() => {
    if (!currentUserId) {
      setChats([]);
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
      },
      (error) => {
        console.error("Chats load error:", error);
      }
    );

    return () => unsub();
  }, [currentUserId]);

  // 3. Resolve Display Names for Users
  useEffect(() => {
    const fetchNames = async () => {
      const unknownIds = new Set<string>();

      chats.forEach((chat) => {
        if (Array.isArray(chat.participants)) {
          chat.participants.forEach((id) => {
            if (id !== currentUserId && !userNames[id]) {
              unknownIds.add(id);
            }
          });
        }
      });

      // Also add URL user ID if provided
      if (urlUserId && !userNames[urlUserId]) {
        unknownIds.add(urlUserId);
      }

      if (unknownIds.size === 0) return;

      const newNames: Record<string, string> = { ...userNames };

      for (const id of Array.from(unknownIds)) {
        try {
          const userDoc = await getDoc(doc(db, "users", id));
          if (userDoc.exists()) {
            newNames[id] = userDoc.data().name || "Unknown User";
          } else {
            newNames[id] = "Unknown User";
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
          newNames[id] = "Unknown User";
        }
      }

      setUserNames(newNames);
    };

    if (chats.length > 0 || urlUserId) {
      fetchNames();
    }
  }, [chats, currentUserId, urlUserId]);

  // 4. Ensure the selected chat document exists (or create it as Pending if deep-linked)
  useEffect(() => {
    const ensureChatDocument = async () => {
      if (!selectedChatId || !currentUserId) return;

      const existingChat = chats.find(c => c.id === selectedChatId);
      if (existingChat) return; // Already exists in listener

      // It must be a deep link via /chat/:userId or brand new /chat/:chatId
      if (urlUserId) {
        const participants = [currentUserId, urlUserId].sort();
        const fixedChatId = participants.join("_");

        const chatRef = doc(db, "chats", fixedChatId);
        const snap = await getDoc(chatRef);

        if (!snap.exists()) {
          // Initialize as pending
          await setDoc(chatRef, {
            participants,
            status: "pending",
            initiatorId: currentUserId,
            createdAt: serverTimestamp(),
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
          });
        }
      }
    };

    ensureChatDocument();
  }, [selectedChatId, currentUserId, chats, urlUserId]);


  // 5. Load Messages for Active Chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, "chats", selectedChatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...(docItem.data() as Omit<Message, "id">),
        }));
        setMessages(msgs);
        scrollToBottom();
      },
      (error) => {
        console.error("Messages load error:", error);
      }
    );

    return () => unsub();
  }, [selectedChatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAcceptRequest = async () => {
    if (!selectedChatId) return;
    try {
      await setDoc(doc(db, "chats", selectedChatId), { status: "accepted" }, { merge: true });
      toast.success("Chat request accepted!");
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

  const handleDeclineRequest = () => {
     setSelectedChatId(null);
     navigate("/chats");
  };

  const sendMessage = async () => {
    if (!currentUser || !selectedChatId || !text.trim() || sending) return;

    // Check if the chat is properly initialized
    const currentChatStatus = selectedChat?.status || "accepted";
    if (currentChatStatus === "pending" && selectedChat?.initiatorId !== currentUserId) {
        toast.error("You must accept the chat request before sending a message.");
        return;
    }

    try {
      setSending(true);
      const messageText = text.trim();
      setText(""); // Optimistic clear

      await addDoc(collection(db, "chats", selectedChatId, "messages"), {
        text: messageText,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // Update Chat Document
      const chatDocUpdate: any = {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
      };
      
      // If we are sending the VERY first message through a new deep-linked window, implicitly set initiator
      if (!selectedChat) {
         chatDocUpdate.status = "pending";
         chatDocUpdate.initiatorId = currentUser.uid;
         if (urlUserId) {
            chatDocUpdate.participants = [currentUser.uid, urlUserId].sort();
         }
      }

      await setDoc(doc(db, "chats", selectedChatId), chatDocUpdate, { merge: true });

      // Build Notification
      let receiverId = "";
      if (selectedChat && Array.isArray(selectedChat.participants)) {
        receiverId = selectedChat.participants.find((id) => id !== currentUser.uid) || "";
      } else if (urlUserId) {
        receiverId = urlUserId;
      }

      if (receiverId) {
        await addDoc(collection(db, "chat_notifications"), {
          receiverId: receiverId,
          senderId: currentUser.uid,
          chatId: selectedChatId,
          message: selectedChat?.status === "pending" ? "New Chat Request" : 
                   (messageText.length > 30 ? messageText.substring(0, 30) + "..." : messageText),
          read: false,
          createdAt: serverTimestamp(),
        });
      }
      scrollToBottom();
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getOtherUserName = (chat: ChatType | null) => {
    if (!chat) {
        // Fallback for brand new deep link
        if (urlUserId) return userNames[urlUserId] || "Unknown User";
        return "Unknown User";
    }
    if (!Array.isArray(chat.participants)) return "Unknown User";
    const otherId = chat.participants.find((id) => id !== currentUserId);
    if (!otherId) return "Unknown User";

    return userNames[otherId] || "Loading...";
  };

  const filteredChats = chats.filter(chat => {
      if (!searchQuery) return true;
      const name = getOtherUserName(chat).toLowerCase();
      return name.includes(searchQuery.toLowerCase());
  });

  // Status Computations
  const isPending = selectedChat?.status === "pending";
  const iAmInitiator = selectedChat?.initiatorId === currentUserId;


  return (
    <div className="flex h-screen w-full bg-[#030712] overflow-hidden font-sans text-white relative pt-20 pb-4 px-4 sm:px-6 gap-6">
      
      {/* AMBIENT GLOWS */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* LEFT SIDEBAR - CHAT LIST */}
      <motion.div 
         initial={{ x: -20, opacity: 0 }}
         animate={{ x: 0, opacity: 1 }}
         className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col rounded-[2rem] border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden z-10 ${selectedChatId ? 'hidden md:flex' : 'flex'}`}
      >
        
        {/* Sidebar Header */}
        <div className="h-[75px] bg-slate-900/50 flex items-center justify-between px-6 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate("/")} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition">
                <ArrowLeft size={20} />
             </button>
             <div className="h-11 w-11 bg-slate-800 border border-slate-700/50 rounded-full flex items-center justify-center cursor-pointer shadow-inner">
                <User size={22} className="text-emerald-400"/>
             </div>
             <span className="font-bold text-[18px] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Chats</span>
          </div>
          <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition">
             <MoreVertical size={20}/>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-4 bg-slate-900/30 border-b border-slate-800">
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl flex items-center px-4 py-2.5 h-[45px] shadow-inner focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
            <Search size={18} className="text-slate-500 mr-3" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none flex-1 text-[15px] text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {filteredChats.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
                 <Search size={32} className="mb-4 opacity-50" />
                 <p className="text-[15px] font-medium">No conversations found</p>
                 <p className="text-xs mt-2 opacity-70 max-w-[200px]">Matches you make or messages you receive will appear here.</p>
             </div>
          ) : (
            filteredChats.map((chat) => {
              const otherName = getOtherUserName(chat);
              const isSelected = selectedChatId === chat.id;
              const hasPendingRequest = chat.status === "pending" && chat.initiatorId !== currentUserId;
              
              return (
                <div
                  key={chat.id}
                  onClick={() => {
                      setSelectedChatId(chat.id);
                      navigate(`/chat/${chat.id}`, { replace: true });
                  }}
                  className={`flex items-center px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 mb-1 ${
                      isSelected 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-sm' 
                      : 'hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="h-12 w-12 flex-shrink-0 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mr-4 relative">
                      <User size={24} className={isSelected ? "text-emerald-400" : "text-slate-400"}/>
                      {hasPendingRequest && (
                         <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-[#030712] animate-pulse"></div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold text-[16px] truncate ${isSelected ? "text-white" : "text-slate-200"}`}>{otherName}</span>
                      {chat.lastMessageTime && (
                           <span className={`text-[11px] font-medium ${isSelected ? "text-emerald-400" : "text-slate-500"}`}>
                                {new Date(chat.lastMessageTime?.toDate()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                           </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {hasPendingRequest ? (
                            <span className="text-[13px] text-rose-400 font-medium truncate flex items-center gap-1.5">
                                <ShieldAlert size={14}/> Request Pending
                            </span>
                        ) : (
                            <span className={`text-[13px] truncate ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                {chat.lastMessage || "Started a chat"}
                            </span>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>


      {/* RIGHT PANE - ACTIVE CHAT */}
      {selectedChatId ? (
        <motion.div 
           initial={{ x: 20, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           className={`flex-1 flex flex-col rounded-[2rem] border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-[0_0_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden z-10 ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}
        >
            
            {/* Active Chat Header */}
            <div className="h-[75px] bg-slate-900/50 flex items-center px-6 border-b border-slate-800 backdrop-blur-md">
                <button className="md:hidden p-2 -ml-2 mr-3 hover:bg-slate-800 rounded-xl text-slate-400 transition" 
                        onClick={() => { setSelectedChatId(null); navigate("/chats"); }}>
                    <ArrowLeft size={20} />
                </button>
                <div className="h-11 w-11 bg-slate-800 border border-slate-700/50 rounded-full flex items-center justify-center mr-4 cursor-pointer shadow-inner">
                    <User size={22} className="text-cyan-400"/>
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                    <span className="font-bold text-[17px] text-white truncate">
                        {getOtherUserName(selectedChat)}
                    </span>
                    {isPending && iAmInitiator && (
                        <span className="text-[12px] font-medium text-emerald-400 truncate">Waiting for user to accept request</span>
                    )}
                </div>
            </div>

            {/* Chat Canvas Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar w-full relative p-4 sm:p-6 bg-[#030712]/40">
                
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center p-4 h-full">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 px-6 py-5 rounded-3xl text-sm text-slate-300 max-w-sm text-center shadow-lg backdrop-blur-md">
                            <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" />
                            <p className="font-medium text-emerald-400 mb-2">End-to-End Encrypted</p>
                            <p className="opacity-80 leading-relaxed">No one outside of this chat, not even FindIt administrators, can read or access your messages securely.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-[4px] max-w-4xl mx-auto pb-4">
                        {messages.map((msg, index) => {
                            const isMine = msg.senderId === currentUserId;
                            const prevMine = index > 0 && messages[index-1].senderId === msg.senderId;
                            
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id} 
                                    className={`flex ${isMine ? "justify-end" : "justify-start"} ${!prevMine ? 'mt-4' : ''}`}
                                >
                                    <div className={`relative max-w-[85%] sm:max-w-[70%] px-4 py-2.5 text-[15px] font-medium leading-relaxed break-words shadow-md ${
                                        isMine 
                                        ? "bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 rounded-2xl rounded-tr-sm" 
                                        : "bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm"
                                    }`}>
                                        
                                        <span>{msg.text}</span>
                                        
                                        <div className={`inline-flex items-center justify-end font-normal ml-3 mt-1.5 h-[15px] float-right ${isMine ? 'text-slate-700' : 'text-slate-500'}`}>
                                            <span className="text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">
                                                {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending"}
                                            </span>
                                            {isMine && (
                                                <span className="ml-1.5 text-slate-800"><CheckCheck size={14}/></span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* BOTTOM BAR - Input or Overlays */}
            {isPending ? (
                // PENDING OVERLAYS
                iAmInitiator ? (
                     <div className="h-[90px] bg-slate-900/80 border-t border-slate-800 flex flex-col items-center justify-center px-6 backdrop-blur-xl">
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                         </div>
                         <p className="text-slate-400 text-sm mt-3 text-center font-medium">Chat Request Sent. Waiting for {getOtherUserName(selectedChat)} to accept.</p>
                     </div>
                ) : (
                    <div className="bg-slate-900/90 border-t border-slate-800 flex flex-col items-center justify-center px-6 py-6 shadow-2xl backdrop-blur-xl">
                        <p className="text-white text-lg font-bold mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400"/> New Chat Request</p>
                        <p className="text-slate-400 text-sm mb-5 text-center max-w-md">If you safely acknowledge exactly who this is, accept the request to start communicating securely.</p>
                        <div className="flex items-center gap-4 w-full max-w-sm">
                            <button onClick={handleDeclineRequest} className="flex-1 py-3 rounded-xl border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 font-bold transition">
                                Decline
                            </button>
                            <button onClick={handleAcceptRequest} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] font-bold transition">
                                Accept Request
                            </button>
                        </div>
                    </div>
                )
            ) : (
                // NORMAL MESSAGE INPUT
                <div className="bg-slate-900/80 border-t border-slate-800 flex items-end px-4 sm:px-6 py-4 gap-3 backdrop-blur-xl">
                    <div className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-2xl flex items-center px-5 py-3 shadow-inner focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Type your message securely..."
                            className="w-full bg-transparent text-white placeholder:text-slate-500 text-[15px] outline-none"
                        />
                    </div>
                    {text.trim() && (
                        <button 
                            onClick={sendMessage}
                            disabled={sending}
                            className="bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 p-3.5 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all flex-shrink-0 disabled:opacity-50"
                        >
                            {sending ? <Sparkles size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
                        </button>
                    )}
                </div>
            )}
        </motion.div>
      ) : (
        /* RIGHT PANE - EMPTY STATE */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center rounded-[2rem] border border-slate-800 bg-slate-900/40 backdrop-blur-xl z-10">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-[360px] mb-8 relative group"
            >
               <div className="w-full aspect-[16/9] bg-slate-950/50 rounded-[2rem] border border-slate-800 flex items-center justify-center shadow-xl overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 group-hover:scale-105 transition-transform duration-700"></div>
                   <div className="text-center relative z-10 px-8">
                       <Zap className="w-10 h-10 mx-auto mb-4 text-emerald-400 opacity-80" />
                       <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">FindIt Bridge</h2>
                       <p className="text-slate-400 text-sm leading-relaxed">Match items with verified finders instantly. Send and receive secure messages privately.</p>
                   </div>
               </div>
            </motion.div>
            <p className="text-[13px] text-slate-500 flex items-center gap-2 font-medium bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
               <ShieldAlert size={14} className="text-emerald-500"/> Your personal messages are end-to-end encrypted
            </p>
        </div>
      )}
    </div>
  );
}
