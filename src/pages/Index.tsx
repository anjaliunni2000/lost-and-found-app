import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_55%)]" />

      <Header />

      <main className="relative mx-auto flex min-h-[calc(100vh-160px)] max-w-6xl flex-col items-center px-6 pb-16 pt-28 md:pt-32">
        <section className="w-full max-w-3xl text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-emerald-400/80">
            Welcome back
          </p>

          <h1 className="mb-4 text-3xl font-semibold capitalize md:text-4xl">
            {displayName} 👋
          </h1>

          <h2 className="mx-auto mb-5 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Upload Your Lost Item Image
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            Our AI system analyzes your image and compares it with reported
            items to identify possible matches quickly and accurately.
          </p>
        </section>

        <section className="mt-12 w-full max-w-2xl">
          <div className="rounded-3xl border border-emerald-400/20 bg-slate-900/70 p-6 shadow-[0_0_30px_rgba(16,185,129,0.10)] backdrop-blur-md md:p-8">
            
              <div className="mb-6 text-center">
  <h3 className="text-xl font-semibold text-white md:text-2xl">
    Start Matching
  </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400 md:text-base">
                Add your lost item details and upload a clear image to search
                for possible matches.
              </p>
            </div>

            <AIMatchHome />
          </div>
        </section>
      </main>

      {showMatchPopup && matchData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-400/20 bg-slate-900 p-6 text-center shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-emerald-400">
              🎉 Match Found!
            </h2>

            <p className="mb-4 text-slate-300">
              We found a possible match for your lost item.
            </p>

            {matchData.confidence_percent && (
              <p className="mb-6 text-emerald-300">
                Confidence: {matchData.confidence_percent}%
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleViewResult}
                className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-black transition hover:bg-cyan-500"
              >
                View Result
              </button>

              <button
                onClick={handleClaim}
                className="rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-black transition hover:bg-emerald-500"
              >
                Claim Item
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminChatBox />
      <Footer />
    </div>
  );
}