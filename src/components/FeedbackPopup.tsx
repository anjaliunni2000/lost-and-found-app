import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const FeedbackPopup = ({ onClose, matchId = "unknown" }: any) => {

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  async function submitFeedback() {

    if (!comment.trim()) {
      toast.error("Please enter feedback comment");
      return;
    }

    try {

      setLoading(true);

      const user = auth.currentUser;

      await addDoc(collection(db, "feedback"), {

        userId: user?.uid || null,
        userEmail: user?.email || "Anonymous",

        matchId,

        rating,
        comment,

        createdAt: serverTimestamp()

      });

      toast.success("Thank you for your feedback!");
      onClose();

    } catch (error) {

      console.error("Feedback save error:", error);
      toast.error("Failed to submit feedback");

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-card p-6 rounded-xl w-[400px]">

        <h2 className="text-xl font-bold mb-4">
          Give Feedback
        </h2>

        <label className="text-sm">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full mb-4 p-2 bg-background rounded"
        >
          <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
          <option value={4}>⭐⭐⭐⭐ Good</option>
          <option value={3}>⭐⭐⭐ Average</option>
          <option value={2}>⭐⭐ Poor</option>
          <option value={1}>⭐ Bad</option>
        </select>

        <label className="text-sm">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          className="w-full p-2 bg-background mb-4 rounded"
          rows={3}
        />

        <div className="flex gap-3">

          <button
            onClick={submitFeedback}
            disabled={loading}
            className="bg-primary px-4 py-2 rounded text-white disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded text-white"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
};

export default FeedbackPopup;
