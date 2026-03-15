import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";

export default function Chat() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#020b24] px-6 py-8 text-white">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/chats")}
            className="rounded-xl bg-slate-700 px-5 py-3 text-white font-medium hover:bg-slate-600 transition"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-white" />
            <h1 className="text-4xl font-bold text-white">Chat</h1>
          </div>
        </div>

        <div className="rounded-3xl bg-[#0b1838] p-8 text-center text-gray-300">
          No user selected for chat.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020b24] px-6 py-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/chats")}
          className="rounded-xl bg-slate-700 px-5 py-3 text-white font-medium hover:bg-slate-600 transition"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          <MessageCircle className="h-7 w-7 text-white" />
          <h1 className="text-4xl font-bold text-white">Chat</h1>
        </div>
      </div>

      <ChatWindow otherUserId={userId} />
    </div>
  );
}