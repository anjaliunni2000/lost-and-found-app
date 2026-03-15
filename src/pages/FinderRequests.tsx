
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function FinderRequests() {

  const { user } = useAuth();

  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // LOAD CLAIM REQUESTS FOR FINDER
  // ================================
  useEffect(() => {

    if (!user) return;

    const q = query(
      collection(db, "claims"),
      where("finderId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snap) => {

      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setClaims(list);
      setLoading(false);

    });

    return () => unsub();

  }, [user]);

  // ================================
  // ACCEPT CLAIM
  // ================================
  const acceptClaim = async (claim: any) => {

    try {

      // update claim status
      await updateDoc(doc(db, "claims", claim.id), {
        finderConfirmed: true,
        status: "approved"
      });

      // create chat room
      await addDoc(collection(db, "chats"), {
        itemId: claim.itemId,
        users: [claim.ownerId, claim.finderId],
        createdAt: serverTimestamp()
      });

      alert("Claim accepted. Chat is now enabled.");

    } catch (err) {
      console.error("Accept claim error:", err);
    }

  };

  // ================================
  // REJECT CLAIM
  // ================================
  const rejectClaim = async (claim: any) => {

    try {

      await updateDoc(doc(db, "claims", claim.id), {
        status: "rejected"
      });

    } catch (err) {
      console.error("Reject claim error:", err);
    }

  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading requests...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <Header />

      <main className="max-w-4xl mx-auto py-24 px-6">

        <h1 className="text-3xl font-bold mb-10 text-center">
          Claim Requests
        </h1>

        {claims.length === 0 && (
          <p className="text-center text-gray-400">
            No claim requests
          </p>
        )}

        <div className="space-y-6">

          {claims.map((claim) => (

            <div
              key={claim.id}
              className="bg-slate-900 border border-emerald-400/20 p-6 rounded-xl"
            >

              <p className="mb-2">
                <span className="text-emerald-400 font-semibold">
                  Lost User ID:
                </span>{" "}
                {claim.ownerId}
              </p>

              <p className="mb-4">
                Someone claims the item you reported as found.
              </p>

              <div className="flex gap-4">

                <button
                  onClick={() => acceptClaim(claim)}
                  className="bg-emerald-400 hover:bg-emerald-500 text-black px-5 py-2 rounded-lg font-semibold"
                >
                  Accept
                </button>

                <button
                  onClick={() => rejectClaim(claim)}
                  className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-semibold"
                >
                  Reject
                </button>

              </div>

            </div>

          ))}

        </div>

      </main>

      <Footer />

    </div>
  );
}

