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
import { 
  Star, 
  MessageCircle, 
  ArrowLeft, 
  BadgeCheck, 
  Shield, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

type FinderItem = {
  id?: string;
  title?: string;
  itemName?: string;
  name?: string;
  description?: string;

  location?: string;
  foundLocation?: string;
  place?: string;

  contactEmail?: string;
  finderEmail?: string;
  email?: string;

  contactPhone?: string;
  finderPhone?: string;
  phone?: string;
  mobile?: string;

  date?: string;
  foundDate?: string;
  createdAt?: any;
  userId?: string;

  secretQuestion?: string;
  secretAnswer?: string;
};

const ClaimItem = () => {
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

  // Anti-fraud state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const proceedToChat = async () => {
    // Notify the Finder that their item was claimed
    const finderEmail = item?.contactEmail || item?.finderEmail || item?.email;
    if (finderEmail && item?.title) {
        const formData = new FormData();
        formData.append("email", finderEmail);
        formData.append("itemTitle", item.title);
        
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-claim-notification`, {
                method: "POST",
                body: formData
            });
            console.log("Claim email triggered to", finderEmail);
        } catch (e) {
            console.warn("Error triggering claim email:", e);
        }
    }

    if (item?.userId) {
      navigate(`/chat/user/${item.userId}`);
    } else if (item?.id) {
      navigate(`/chat/user/${item.id}`);
    } else {
      toast.error("User ID not found");
    }
  };

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
        const collectionsToTry = ["items", "found_items", "foundItems"];
        let foundData: FinderItem | null = null;

        for (const collectionName of collectionsToTry) {
          const docRef = doc(db, collectionName, id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            foundData = {
              id: docSnap.id,
              ...(docSnap.data() as FinderItem),
            };
            break;
          }
        }

        setItem(foundData);
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
        itemTitle: item.title || item.itemName || item.name || "",
        finderEmail: item.contactEmail || item.finderEmail || item.email || "",
        finderPhone:
          item.contactPhone || item.finderPhone || item.phone || item.mobile || "",
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
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
           className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] text-white">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center max-w-sm"
        >
          <XCircle className="w-16 h-16 text-rose-500 mb-4" />
          <p className="text-2xl font-bold mb-2">Item Not Found</p>
          <p className="text-slate-400 text-center mb-6">The requested item might have been deleted or resolved.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const foundLocation = item.foundLocation || item.location || item.place || "Unspecified Location";
  const finderEmail = item.finderEmail || item.contactEmail || item.email || "No Email Provided";
  const finderPhone = item.finderPhone || item.contactPhone || item.phone || item.mobile || "No Phone Provided";
  const foundDate = item.foundDate || item.date || "Unknown Date";
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-white overflow-hidden py-24 px-4 sm:px-6">
      
      {/* AMBIENT GLOWS */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-3xl relative z-10">
        
        {/* HEADER BAR */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center justify-between"
        >
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
           >
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             <span>Back to Previous</span>
           </button>
           
           <div className="px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-2">
             <Shield className="w-3.5 h-3.5 text-emerald-400" />
             <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Secure Claim</span>
           </div>
        </motion.div>

        {/* MAIN CLAIM CARD */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="rounded-[2.5rem] border border-emerald-500/20 bg-slate-900/60 p-6 sm:p-10 shadow-[0_0_50px_-15px_rgba(16,185,129,0.15)] backdrop-blur-xl"
        >
          <motion.div variants={itemVariants} className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Finder Details
            </h1>
            <p className="mt-4 text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
              Review the contact information and metadata provided by the finder. Be sure to securely claim your item using the automated chat bridge.
            </p>
          </motion.div>

          {/* INFORMATION GRID */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {/* Location */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/20 shadow-inner border border-slate-700/30 hover:bg-slate-800/40 transition-colors">
              <div className="bg-slate-700/40 p-2.5 rounded-xl text-cyan-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Found Location</p>
                <p className="text-slate-200 font-medium leading-tight">{foundLocation}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/20 shadow-inner border border-slate-700/30 hover:bg-slate-800/40 transition-colors">
              <div className="bg-slate-700/40 p-2.5 rounded-xl text-emerald-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Found Date</p>
                <p className="text-slate-200 font-medium leading-tight">{foundDate}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/20 shadow-inner border border-slate-700/30 hover:bg-slate-800/40 transition-colors">
              <div className="bg-slate-700/40 p-2.5 rounded-xl text-amber-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="overflow-hidden w-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Finder Email</p>
                <p className="text-slate-200 font-medium leading-tight truncate w-full">{finderEmail}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/20 shadow-inner border border-slate-700/30 hover:bg-slate-800/40 transition-colors">
              <div className="bg-slate-700/40 p-2.5 rounded-xl text-indigo-400 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="overflow-hidden w-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Finder Phone</p>
                <p className="text-slate-200 font-medium leading-tight truncate w-full">{finderPhone}</p>
              </div>
            </div>
          </motion.div>

          {/* ACTIONS */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-slate-700/50">
            <button
              onClick={() => {
                if (item.secretQuestion && item.secretAnswer) {
                  setShowVerificationModal(true);
                } else {
                  proceedToChat();
                }
              }}
              className="flex-1 group relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-4 font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Chat with Finder</span>
            </button>

            <button
              onClick={() => setShowReviewModal(true)}
              className="sm:w-[160px] flex justify-center items-center gap-2 rounded-2xl bg-amber-400/10 border border-amber-400/30 px-6 py-4 font-semibold text-amber-400 hover:bg-amber-400 hover:text-black hover:-translate-y-1 transition-all duration-300"
            >
              <Star className="w-5 h-5 fill-current" />
              Rate Us
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* VERIFICATION MODAL */}
      <AnimatePresence>
      {showVerificationModal && item?.secretQuestion && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#030712]/80 px-4 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900 p-8 shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)] overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>

            <div className="flex justify-center mb-6 mt-2">
               <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
                 <Shield className="w-10 h-10 text-emerald-400" />
               </div>
            </div>
            <h2 className="mb-2 text-2xl font-extrabold text-center text-white">
              Proof of Ownership
            </h2>
            <p className="mb-8 text-slate-400 text-sm text-center">
              The Finder securely locked this item. You must answer their secret question to prove it's yours.
            </p>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Secret Question</span>
              </div>
              <p className="text-slate-200 mt-1 text-md font-medium leading-snug">{item.secretQuestion}</p>
            </div>

            <input
              type="text"
              placeholder="Enter Exact Answer..."
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setVerificationError("");
              }}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-4 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all outline-none mb-2"
            />
            
            {verificationError && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-rose-400 text-sm mb-4 text-center">{verificationError}</motion.p>
            )}

            <div className="flex gap-3 mt-8">
               <button
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1 rounded-xl bg-slate-800 border border-slate-700 py-3.5 font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  Cancel
               </button>
               <button
                 onClick={() => {
                   if (userAnswer.trim().toLowerCase() === item.secretAnswer?.toLowerCase()) {
                     setShowVerificationModal(false);
                     proceedToChat();
                   } else {
                     setVerificationError("Incorrect answer. Please try again.");
                   }
                 }}
                 className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3.5 font-bold text-slate-950 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition"
               >
                 Verify Answer
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* REVIEW MODAL */}
      <AnimatePresence>
      {showReviewModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#030712]/80 px-4 backdrop-blur-md"
        >
          <motion.div 
             initial={{ scale: 0.9, y: 30 }}
             animate={{ scale: 1, y: 0 }}
             exit={{ scale: 0.95, opacity: 0 }}
             className="w-full max-w-lg rounded-3xl border border-amber-500/30 bg-slate-900 p-8 sm:p-10 text-white shadow-[0_0_60px_-15px_rgba(251,191,36,0.2)] overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500"></div>

            {!reviewSuccess ? (
              <>
                <h2 className="mb-2 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                  Share Your Feedback
                </h2>

                <p className="mb-8 text-slate-400 text-sm">
                  Your review directly helps us improve the lost and found experience for everyone.
                </p>

                <div className="mb-8">
                  <p className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Rate your experience
                  </p>

                  <div className="flex gap-2 justify-center py-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoveredRating || rating);

                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            size={40}
                            className={`transition-all duration-300 ${
                               active
                                 ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                                 : "text-slate-700"
                             }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block mb-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Write your review <span className="text-slate-600 font-normal normal-case">(Optional)</span>
                  </label>

                  <textarea
                    placeholder="Tell us what went well..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-white placeholder:text-slate-600 outline-none transition focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 shadow-inner resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setRating(0);
                      setHoveredRating(0);
                      setReview("");
                    }}
                    disabled={submittingReview}
                    className="sm:w-[120px] rounded-xl bg-slate-800 border border-slate-700 px-6 py-3.5 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white order-2 sm:order-1 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-3.5 font-bold text-slate-950 transition hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] disabled:opacity-60 disabled:cursor-not-allowed order-1 sm:order-2"
                  >
                    {submittingReview ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                  <BadgeCheck className="h-20 w-20 text-emerald-400 relative z-10" />
                </div>

                <h3 className="mb-3 text-3xl font-extrabold text-white">
                  Thank You!
                </h3>

                <p className="text-slate-400">
                  Your review has been successfully submitted and helps us improve the platform.
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default ClaimItem;