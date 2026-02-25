import { useParams, useNavigate } from "react-router-dom";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { toast } from "sonner";

export default function ClaimConfirmFinder() {

  const { claimId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  async function confirmFinder() {

    if (!claimId) {
      toast.error("Invalid claim");
      return;
    }

    try {

      setLoading(true);

      const claimRef = doc(db, "claims", claimId);

      // ⭐ Step 1 — Mark Finder Confirmed
      await updateDoc(claimRef, {
        finderConfirmed: true,
        finderConfirmedAt: new Date()
      });

      // ⭐ Step 2 — Get Updated Claim
      const snap = await getDoc(claimRef);

      if (!snap.exists()) {
        toast.error("Claim not found");
        return;
      }

      const data: any = snap.data();

      // ⭐ Step 3 — If BOTH confirmed → COMPLETE CLAIM + ITEM
      if (data.ownerConfirmed === true && data.finderConfirmed === true) {

        // ✅ Complete Claim
        await updateDoc(claimRef, {
          status: "completed",
          completedAt: new Date()
        });

        // ✅ Complete Item
        if (data.itemId) {
          await updateDoc(doc(db, "items", data.itemId), {
            status: "completed",
            completedAt: new Date()
          });
        }

        toast.success("🎉 Claim Completed Successfully");

        // ⭐ Redirect after success
        setTimeout(() => {
          navigate("/browse");
        }, 1500);

      } else {

        toast.success("Finder confirmed. Waiting for Owner confirmation.");

      }

    } catch (error) {

      console.error("Confirm Finder Error:", error);
      toast.error("Failed to confirm. Try again.");

    } finally {

      setLoading(false);

    }

  }

  return (
    <div className="p-10 text-white flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-6">
        Confirm Item Returned
      </h1>

      <p className="text-gray-400 mb-8 text-center max-w-md">
        Please confirm that you have successfully returned the item to the owner.
      </p>

      <button
        disabled={loading}
        onClick={confirmFinder}
        className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-lg font-semibold disabled:opacity-50 transition"
      >
        {loading ? "Confirming..." : "Yes, I Returned The Item"}
      </button>

    </div>
  );
}
