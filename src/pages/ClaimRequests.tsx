import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClaimRequests() {

  const [claims, setClaims] = useState<any[]>([]);

  // Replace later with Firebase Auth user email
  const finderEmail = "test@example.com";

  useEffect(() => {

    const q = query(
      collection(db, "claims"),
      where("finderEmail", "==", finderEmail)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const list: any[] = [];

      snapshot.forEach((docItem) => {
        list.push({
          id: docItem.id,
          ...docItem.data()
        });
      });

      setClaims(list);

    });

    return () => unsubscribe();

  }, []);

  const acceptClaim = async (id: string) => {
    await updateDoc(doc(db, "claims", id), {
      status: "accepted"
    });
  };

  const rejectClaim = async (id: string) => {
    await updateDoc(doc(db, "claims", id), {
      status: "rejected"
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      <Header />

      <main className="pt-28 pb-16 px-6">

        <div className="max-w-4xl mx-auto">

          <h1 className="text-3xl font-bold mb-8">
            Claim Requests
          </h1>

          {claims.length === 0 && (
            <p className="text-slate-400">
              No claim requests yet
            </p>
          )}

          <div className="space-y-6">

            {claims.map((claim) => (

              <div
                key={claim.id}
                className="bg-slate-900 p-6 rounded-2xl"
              >

                <h3 className="text-xl font-semibold mb-2">
                  {claim.itemTitle}
                </h3>

                <p className="text-slate-400 mb-4">
                  Status: {claim.status}
                </p>

                {claim.status === "pending" && (

                  <div className="flex gap-4">

                    <button
                      onClick={() => acceptClaim(claim.id)}
                      className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => rejectClaim(claim.id)}
                      className="bg-red-500 hover:bg-red-600 text-black px-4 py-2 rounded-lg"
                    >
                      Reject
                    </button>

                  </div>

                )}

              </div>

            ))}

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}