import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FeedbackPopup from "@/components/FeedbackPopup";

import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { useAuth } from "@/context/AuthContext";

export default function MatchResultPage() {

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const matchedItem: any = location.state;

  const [finderDetails, setFinderDetails] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loadingFinder, setLoadingFinder] = useState(true);

  // ================================
  // If page opened without state
  // ================================
  if (!matchedItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        No match data available
      </div>
    );
  }

  // ================================
  // Load finder details
  // ================================
  useEffect(() => {

    const loadFinder = async () => {

      try {

        if (!matchedItem?.itemId) {
          setLoadingFinder(false);
          return;
        }

        const ref = doc(db, "items", matchedItem.itemId);
        const snap = await getDoc(ref);

        if (snap.exists()) {

          const data = snap.data();

          setFinderDetails({
            email: data.contactEmail || "Not provided",
            location: data.location || "Unknown",
            date: data.date || "Unknown",
            finderId: data.userId || null
          });

        }

      } catch (error) {

        console.error("Error loading finder:", error);

      }

      setLoadingFinder(false);

    };

    loadFinder();

  }, [matchedItem]);


  // ================================
  // Start Chat (WhatsApp style)
  // ================================
  const startChat = async () => {

    try {

      if (!user) {
        alert("Please login first");
        return;
      }

      if (!finderDetails?.finderId) {
        alert("Finder information not available");
        return;
      }

      // 🔎 Check if chat already exists
      const q = query(
        collection(db, "chats"),
        where("itemId", "==", matchedItem.itemId),
        where("ownerId", "==", user.uid),
        where("finderId", "==", finderDetails.finderId)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {

        const existingChat = snap.docs[0];

        navigate(`/chat/${existingChat.id}`);
        return;

      }

      // 🆕 Create new chat
      const chatRef = await addDoc(collection(db, "chats"), {

        itemId: matchedItem.itemId,

        ownerId: user.uid,
        ownerEmail: user.email || "",

        finderId: finderDetails.finderId,
        finderEmail: finderDetails.email || "",

        createdAt: serverTimestamp(),
        lastMessage: "",
        lastMessageTime: serverTimestamp()

      });

      console.log("Chat created:", chatRef.id);

      navigate(`/chat/${chatRef.id}`);

    } catch (error) {

      console.error("Chat creation failed:", error);
      alert("Failed to open chat");

    }

  };


  // ================================
  // Image URL
  // ================================
  const imageUrl = matchedItem?.file
    ? `http://localhost:5000/database/${matchedItem.file}`
    : null;


  return (

    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-950 text-white">

      <div className="bg-slate-900 p-8 rounded-xl w-[420px] text-center shadow-xl">

        <h1 className="text-3xl text-cyan-400 mb-4 font-bold">
          🎉 Match Found
        </h1>

        <p className="text-gray-400 mb-6">
          We found a possible match for your lost item.
        </p>

        {/* IMAGE */}
        {imageUrl && (

          <div className="mb-6">

            <img
              src={imageUrl}
              alt="Matched Item"
              className="h-48 mx-auto rounded-lg bg-slate-800 p-2"
            />

          </div>

        )}

        {/* CONFIDENCE */}
        <p className="text-cyan-300 font-semibold mb-6">
          Confidence: {matchedItem?.confidence_percent || 0}%
        </p>

        {/* FINDER DETAILS */}
        <div className="bg-slate-800 p-4 rounded-lg mb-6 text-left">

          <h3 className="text-cyan-300 text-lg mb-3 text-center">
            Finder Details
          </h3>

          {loadingFinder ? (

            <p className="text-center text-gray-400">
              Loading finder details...
            </p>

          ) : (

            <div className="space-y-2 text-sm">

              <p>📧 Email: {finderDetails?.email}</p>

              <p>📍 Location: {finderDetails?.location}</p>

              <p>📅 Date: {finderDetails?.date}</p>

            </div>

          )}

        </div>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3">

          <button
            onClick={startChat}
            className="bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold"
          >
            💬 Chat with Finder
          </button>

          <button
            onClick={() => setShowFeedback(true)}
            className="bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg font-semibold"
          >
            ⭐ Rate Us
          </button>

        </div>

        {showFeedback && (
          <FeedbackPopup onClose={() => setShowFeedback(false)} />
        )}

      </div>

    </div>

  );

}