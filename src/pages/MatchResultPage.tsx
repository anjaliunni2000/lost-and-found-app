import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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

import { Shield } from "lucide-react";

export default function MatchResultPage() {

  const { user: authUser } = useAuth(); // Renamed to avoid conflict with local 'user' state
  const navigate = useNavigate();
  const { matchId } = useParams();
  const location = useLocation();
  const matchedItem = location.state?.matchedItem;

  const [finderDetails, setFinderDetails] = useState<any>(null);
  const [loadingFinder, setLoadingFinder] = useState(true);

  const [showFeedback, setShowFeedback] = useState(false);
  const [user, setUser] = useState<any>(null); // This seems to be a duplicate of authUser or intended for something else. Keeping as per instruction.

  // Anti-fraud state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [verificationError, setVerificationError] = useState("");

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

        const ref = doc(db, "found_items", matchedItem.itemId);
        const snap = await getDoc(ref);

        if (snap.exists()) {

          const data = snap.data();

          setFinderDetails({
            email: data.contactEmail || "Not provided",
            location: data.location || "Unknown",
            date: data.date || "Unknown",
            finderId: data.userId || null,
            secretQuestion: data.secretQuestion,
            secretAnswer: data.secretAnswer
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

      navigate(`/chat/user/${finderDetails.finderId}`);

    } catch (error) {

      console.error("Chat initialization failed:", error);
      alert("Failed to open chat");

    }

  };


  // ================================
  // Image URL
  // ================================
  const imageUrl = matchedItem?.file
    ? `${import.meta.env.VITE_API_BASE_URL}/database/${matchedItem.file}`
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
            onClick={() => {
              if (finderDetails?.secretQuestion && finderDetails?.secretAnswer) {
                setShowVerificationModal(true);
              } else {
                startChat();
              }
            }}
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

      {showVerificationModal && finderDetails?.secretQuestion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-emerald-400/20 bg-[#0b1530] p-8 text-white shadow-2xl">
            <div className="flex justify-center mb-4">
               <Shield className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-center text-emerald-400">
              Proof of Ownership
            </h2>
            <p className="mb-6 text-gray-400 text-sm text-center">
              The Finder securely locked this item. You must answer their secret question to prove it's yours.
            </p>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-6 text-left">
              <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Secret Question</span>
              <p className="text-white mt-1 text-lg font-medium">{finderDetails.secretQuestion}</p>
            </div>

            <input
              type="text"
              placeholder="Enter Exact Answer..."
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setVerificationError("");
              }}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-4 text-white focus:border-emerald-400 focus:outline-none mb-2"
            />
            
            {verificationError && (
              <p className="text-red-400 text-sm mb-4 text-center animate-pulse">{verificationError}</p>
            )}

            <div className="flex gap-3 mt-6">
               <button
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1 rounded-xl bg-slate-700 py-3 font-semibold text-white transition hover:bg-slate-600"
                >
                  Cancel
               </button>
               <button
                 onClick={() => {
                   if (userAnswer.trim().toLowerCase() === finderDetails.secretAnswer?.toLowerCase()) {
                     setShowVerificationModal(false);
                     startChat();
                   } else {
                     setVerificationError("Incorrect answer. Please try again.");
                   }
                 }}
                 className="flex-1 rounded-xl bg-emerald-400 py-3 font-bold text-black transition hover:bg-emerald-500"
               >
                 Verify Answer
               </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );

}