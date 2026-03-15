import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { db } from "@/lib/firebase";
import { Star, MessageCircle, ArrowLeft, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type FinderItem = {
  id?: string;
  title?: string;
  description?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  date?: string;
};

const FinderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const locationState = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState<FinderItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      const stateItem = locationState.state?.item || locationState.state?.match;

      if (stateItem) {
        setItem(stateItem as FinderItem);
        setLoading(false);
        return;
      }

      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "items", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setItem({
            id: docSnap.id,
            ...docSnap.data(),
          } as FinderItem);
        } else {
          setItem(null);
        }
      } catch (error) {
        console.error("Error fetching finder details:", error);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, locationState.state]);

  const handleSubmitReview = async () => {
    if (!item?.id) {
      toast.error("Item not found");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setSubmittingReview(true);

      await addDoc(collection(db, "feedback"), {
        itemId: item.id,
        itemTitle: item.title || "",
        finderEmail: item.contactEmail || "",
        finderPhone: item.contactPhone || "",
        userEmail: user?.email || "anonymous",
        rating,
        message: review.trim(),
        createdAt: serverTimestamp(),
      });

      setReviewSuccess(true);
      toast.success("Review submitted successfully");

      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess(false);
        setRating(0);
        setHoveredRating(0);
        setReview("");
      }, 1500);
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <p className="text-lg">Loading finder details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] text-white">
        <p className="text-2xl font-semibold">Item not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-slate-700 px-6 py-3 text-white hover:bg-slate-600"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-[30px] border border-cyan-400/20 bg-[#0b1530] p-8 shadow-2xl">
          <h1 className="mb-8 text-4xl font-bold text-emerald-400">
            Finder Details
          </h1>

          <div className="space-y-5 text-xl text-gray-200">
            <p>
              <span className="font-semibold text-white">Found Location:</span>{" "}
              {item.location || "Not available"}
            </p>

            <p>
              <span className="font-semibold text-white">Finder Email:</span>{" "}
              {item.contactEmail || "Not available"}
            </p>

            <p>
              <span className="font-semibold text-white">Finder Phone:</span>{" "}
              {item.contactPhone || "Not available"}
            </p>

            <p>
              <span className="font-semibold text-white">Found Date:</span>{" "}
              {item.date || "Not available"}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/chats")}
              className="flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black transition hover:scale-[1.02] hover:bg-emerald-500"
            >
              <MessageCircle size={20} />
              Chat with Finder
            </button>

            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:scale-[1.02] hover:bg-yellow-500"
            >
              <Star size={20} />
              Rate Us
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-slate-600"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-400/20 bg-[#0b1530] p-8 text-white shadow-2xl">
            {!reviewSuccess ? (
              <>
                <h2 className="mb-2 text-3xl font-bold text-emerald-400">
                  Share Your Feedback
                </h2>

                <p className="mb-6 text-gray-400">
                  Your review helps us improve the lost and found experience.
                </p>

                <div className="mb-6">
                  <p className="mb-3 text-lg font-medium text-white">
                    Rate your experience
                  </p>

                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoveredRating || rating);

                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition hover:scale-110"
                        >
                          <Star
                            size={34}
                            className={
                              active
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-500"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-lg font-medium text-white">
                    Write your review
                  </label>

                  <textarea
                    placeholder="Tell us about your experience..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-4 text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>

                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setRating(0);
                      setHoveredRating(0);
                      setReview("");
                    }}
                    className="rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 rounded-full bg-emerald-400/20 p-4">
                  <BadgeCheck className="h-12 w-12 text-emerald-400" />
                </div>

                <h3 className="mb-2 text-2xl font-bold text-emerald-400">
                  Review Submitted
                </h3>

                <p className="text-gray-300">
                  Thank you for your valuable feedback.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FinderDetails;