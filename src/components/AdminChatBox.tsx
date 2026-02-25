import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminChatBox() {

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const db = getFirestore();

  const handleSend = async () => {

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("Please login to message admin");
      return;
    }

    if (!message.trim()) return;

    try {
      await addDoc(collection(db, "adminMessages"), {
        userId: user.uid,
        userEmail: user.email,
        message,
        status: "unread",
        createdAt: serverTimestamp()
      });

      toast.success("Message sent to admin");
      setMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  return (
    <>
      {/* Floating Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="bg-cyan-500 hover:bg-cyan-400 text-black w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition"
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
      </div>

      {/* Chat Box */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-80 bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl p-4 z-50"
          >

            <h3 className="text-cyan-400 font-semibold mb-3">
              Admin Support
            </h3>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full h-24 bg-slate-800 text-white rounded-lg p-2 resize-none outline-none"
            />

            <button
              onClick={handleSend}
              className="mt-3 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Send
            </button>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}