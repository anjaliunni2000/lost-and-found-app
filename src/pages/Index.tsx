import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIMatchHome from "@/components/AIMatchHome";
import AdminChatBox from "@/components/AdminChatBox";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

type MatchData = {
  id: string;
  finderId?: string | null;
  confidence_percent?: number;
  [key: string]: any;
};

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "matches"), where("ownerId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      setMatchData((prev) => {
        if (prev?.id === docSnap.id) return prev;

        setShowMatchPopup(true);

        return {
          id: docSnap.id,
          ...data,
        };
      });
    });

    return () => unsubscribe();
  }, [user]);

  const handleClaim = async () => {
    if (!matchData || !user) return;

    try {
      await addDoc(collection(db, "claims"), {
        matchId: matchData.id,
        ownerId: user.uid,
        finderId: matchData.finderId || null,
        ownerConfirmed: true,
        finderConfirmed: false,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setShowMatchPopup(false);
      alert("Claim request sent to finder!");
    } catch (error) {
      console.error("Claim failed:", error);
    }
  };

  const handleViewResult = () => {
    if (!matchData) return;

    navigate(`/match-result/${matchData.id}`, {
      state: matchData,
    });
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

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      {/* NOISE & GRADIENT BACKGROUND */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#030712] to-[#030712]"></div>
      
      {/* AMBIENT GLOWING ORBS */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[130px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[30%] -right-[5%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none"
      />

      <Header />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-160px)] max-w-6xl flex-col items-center px-4 pb-16 pt-24 md:pt-32">
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-300 font-mono">
              Welcome back, {displayName}
            </p>
          </motion.div>

          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl lg:leading-[1.1]">
            Find What You Lost With{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 drop-shadow-sm">
              AI Precision
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 mb-10">
            Our advanced AI vision model instantly analyzes your item details and imagery, scanning thousands of findings to locate your perfect match.
          </p>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {/* GLASSMORPHIC CONTAINER */}
          <div className="relative group rounded-[2rem] p-[1px] bg-gradient-to-b from-emerald-500/40 to-cyan-500/10 hover:from-emerald-400/60 hover:to-cyan-400/30 transition-all duration-700 shadow-[0_0_50px_-15px_rgba(16,185,129,0.25)]">
            <div className="rounded-[31px] bg-slate-950/80 p-6 md:p-8 backdrop-blur-2xl shrink-0 h-full w-full">
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                  New Match Request
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Provide an image or description of your lost item.
                </p>
              </div>

              <AIMatchHome />
            </div>
          </div>
        </motion.section>
      </main>

      {/* ENHANCED MATCH POPUP */}
      <AnimatePresence>
        {showMatchPopup && matchData && (
           <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/80 backdrop-blur-md px-4"
         >
           <motion.div 
             initial={{ scale: 0.9, y: 30 }}
             animate={{ scale: 1, y: 0 }}
             exit={{ scale: 0.95, y: -20, opacity: 0 }}
             className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-[0_0_80px_-15px_rgba(16,185,129,0.3)]"
           >
             {/* TOP GLOW BAR */}
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400"></div>
             
             <div className="p-8 text-center pt-10">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 shadow-inner"
                >
                  <span className="text-4xl text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]">🎯</span>
                </motion.div>
                
                <h2 className="mb-2 text-3xl font-bold text-white tracking-tight">
                  Match Found!
                </h2>

                <p className="mb-8 text-slate-400 text-sm">
                  Our AI vision system found a highly probable match.
                </p>

                {matchData.confidence_percent && (
                  <div className="mb-8 p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col items-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] mb-2">
                      AI Confidence
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        {matchData.confidence_percent}
                      </span>
                      <span className="text-emerald-400 text-xl font-bold">%</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row w-full">
                  <button
                    onClick={handleViewResult}
                    className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3.5 font-semibold text-white transition-colors duration-200"
                  >
                     Details
                  </button>

                  <button
                    onClick={handleClaim}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-3.5 font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
                  >
                    Claim Item
                  </button>
                </div>
             </div>
           </motion.div>
         </motion.div>
        )}
      </AnimatePresence>

      <AdminChatBox />
      <Footer />
    </div>
  );
}