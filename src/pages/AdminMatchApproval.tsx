import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { toast } from "sonner";

export default function AdminMatchApproval() {

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // =============================
  // FETCH MATCHES
  // =============================
  const fetchMatches = async () => {
    try {
      const q = query(
        collection(db, "matches"),
        where("status", "==", "found")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setMatches(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // =============================
  // APPROVE / REJECT
  // =============================
  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "matches", id), {
        status
      });

      toast.success(`Match ${status}`);
      fetchMatches();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  // =============================
  // UI
  // =============================
  if (loading) {
    return <div className="p-10 text-white">Loading matches...</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] p-10 text-white">

      <h1 className="text-3xl font-bold mb-8">
        Admin Match Approval
      </h1>

      <div className="space-y-6">

        {matches.map(match => (

          <div
            key={match.id}
            className="bg-slate-900 rounded-2xl p-6 flex gap-6 shadow-lg"
          >

            <div className="w-36 h-36 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
  {match.file ? (
    <img
      src={`http://localhost:5000/database/${match.file}`}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.src = "/no-image.png";
      }}
    />
  ) : (
    <p className="text-slate-400">No Image</p>
  )}
</div>

            {/* DETAILS */}
            <div className="flex-1">

              <h2 className="text-xl font-semibold mb-2">
                {match.itemName || match.label || "Unknown Item"}
              </h2>

              <div className="text-sm text-slate-300 space-y-1">

                <p>📍 Location: {match.location || "N/A"}</p>
                <p>📝 Description: {match.description || "N/A"}</p>
                <p>📧 Email: {match.email || "N/A"}</p>
                <p>📞 Phone: {match.phone || "N/A"}</p>

                <p className="mt-2 font-semibold text-cyan-400">
                  Confidence: {match.confidence || 0}%
                </p>

                <p className="text-green-400">
                  Status: {match.status}
                </p>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 mt-4">

                <button
                  onClick={() => updateStatus(match.id, "approved")}
                  className="px-5 py-2 bg-green-600 rounded-lg hover:bg-green-500"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(match.id, "rejected")}
                  className="px-5 py-2 bg-red-600 rounded-lg hover:bg-red-500"
                >
                  Reject
                </button>

              </div>

            </div>

          </div>

        ))}

        {matches.length === 0 && (
          <p className="text-slate-400">
            No matches pending approval
          </p>
        )}

      </div>

    </div>
  );
}
