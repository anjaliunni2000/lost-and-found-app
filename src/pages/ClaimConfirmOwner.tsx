import { useParams } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function ClaimConfirmOwner() {

  const { claimId } = useParams();

  async function confirmOwner() {

    await updateDoc(doc(db, "claims", claimId!), {
      ownerConfirmed: true
    });

    alert("Owner confirmation saved");
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl mb-6">
        Confirm Item Claim
      </h1>

      <button
        onClick={confirmOwner}
        className="bg-green-500 px-6 py-3 rounded"
      >
        Yes This Is My Item
      </button>
    </div>
  );
}
