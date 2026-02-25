import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import FeedbackPopup from "@/components/FeedbackPopup";

const MatchResultPage = () => {

  const [showFeedback, setShowFeedback] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // ⭐ Get matched item from navigation state
  const matchedItem = location.state as any;

  console.log("Match ID:", id);
  console.log("Matched Item:", matchedItem);

  const handleViewDetails = () => {
    if (!id) {
      alert("Match details not available");
      return;
    }

    navigate(`/match-details/${id}`, {
      state: matchedItem
    });
  };

  if (!matchedItem) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>No match data available. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-4xl font-bold mb-6 text-cyan-400">
        🎉 Match Found!
      </h1>

      <p className="mb-6 text-slate-300">
        We found a possible match for your lost item.
      </p>

      {/* Matched Item Image */}
      {matchedItem.file && (
        <img
          src={`http://localhost:5000/database/${matchedItem.file}`}
          alt="Matched Item"
          className="h-60 rounded-xl mb-6 bg-slate-800 p-4"
        />
      )}

      {/* Confidence */}
      <p className="mb-6 text-lg text-cyan-300">
        Confidence: {matchedItem.confidence_percent}%
      </p>

      {/* Founder Details */}
      <div className="mb-8">
        <p className="text-slate-400">Founder ID:</p>
        <p className="font-semibold">{matchedItem.ownerId || "Not Available"}</p>
      </div>

      {/* Buttons */}
      <button
        onClick={() => setShowFeedback(true)}
        className="bg-primary px-6 py-3 rounded-lg"
      >
        I Received My Item ✅
      </button>

      <button
        onClick={handleViewDetails}
        className="bg-cyan-500 px-6 py-3 rounded-lg ml-4"
      >
        View Match Details 🔍
      </button>

      {showFeedback && (
        <FeedbackPopup onClose={() => setShowFeedback(false)} />
      )}

    </div>
  );
};

export default MatchResultPage;