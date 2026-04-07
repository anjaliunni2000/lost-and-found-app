import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "@/components/AdminSidebar";
import { toast } from "sonner";
import { CheckCircle, XCircle, Search } from "lucide-react";

export default function AdminResolutions() {
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResolutions();
  }, []);

  const fetchResolutions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "resolutions"), where("status", "==", "pending_admin"));
      const snap = await getDocs(q);
      setResolutions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Failed to fetch resolutions", err);
      toast.error("Failed to load resolution queue");
    }
    setLoading(false);
  };

  const notifyUser = async (userId: string | null, title: string, message: string) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        title,
        message,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to send notification", err);
    }
  };

  const handleApprove = async (resolution: any) => {
    try {
      // 1. Mark resolution as approved
      await updateDoc(doc(db, "resolutions", resolution.id), { status: "approved" });

      // 2. Mark the actual item as resolved
      const itemRefFound = doc(db, "found_items", resolution.itemId);
      const itemRefLost = doc(db, "items", resolution.itemId);
      try {
        await updateDoc(itemRefFound, { status: "resolved" });
      } catch (e) {
        // Fallback
        await updateDoc(itemRefLost, { status: "resolved" });
      }

      // 3. Notify the Claimer
      await notifyUser(
        resolution.claimerId,
        "🎉 Claim Approved!",
        `Your Victory Photo for '${resolution.itemTitle}' was approved! Case closed.`
      );

      // 4. Notify the Finder
      if (resolution.finderId) {
        await notifyUser(
          resolution.finderId,
          "✅ Item Resolved",
          `An Admin verified the handover for '${resolution.itemTitle}'. Thank you for your honesty!`
        );
      }

      toast.success("Resolution Approved!");
      setResolutions(prev => prev.filter(r => r.id !== resolution.id));
    } catch (err) {
      console.error("Approval error", err);
      toast.error("Failed to approve resolution");
    }
  };

  const handleReject = async (resolution: any) => {
    try {
      await updateDoc(doc(db, "resolutions", resolution.id), { status: "rejected" });
      await notifyUser(
        resolution.claimerId,
        "🚫 Claim Rejected",
        `Your Victory Photo for '${resolution.itemTitle}' was rejected by the Admin. Please contact support.`
      );
      toast.success("Resolution Rejected");
      setResolutions(prev => prev.filter(r => r.id !== resolution.id));
    } catch (err) {
      console.error("Rejection error", err);
      toast.error("Failed to reject resolution");
    }
  };

  return (
    <div className="flex bg-[#020617] min-h-screen text-white">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-4">Victory Photo Resolutions 📸</h1>
        <p className="text-gray-400 mb-10">
          Review incoming photographic evidence of retrieved items. Approve to officially close the case.
        </p>

        {loading ? (
          <div className="text-center text-gray-500 mt-20">Loading queue...</div>
        ) : resolutions.length === 0 ? (
          <div className="text-center bg-slate-900 border border-slate-800 p-12 rounded-2xl flex flex-col items-center">
            <Search className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-gray-400 text-lg">No pending resolutions at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolutions.map((res) => (
              <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="h-64 bg-black relative">
                  <img src={res.photoData} alt="Victory Evidence" className="w-full h-full object-contain" />
                  <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Pending Review
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2">{res.itemTitle}</h3>
                  <p className="text-sm text-gray-400 mb-1">
                    <span className="text-gray-500 font-semibold">Claimer:</span> {res.claimerEmail}
                  </p>
                  
                  {res.message && (
                    <div className="mt-4 bg-slate-800 p-4 rounded-xl text-sm italic text-gray-300 border border-slate-700 flex-1">
                      "{res.message}"
                    </div>
                  )}

                  <div className="flex gap-3 mt-6 pt-6 border-t border-slate-800">
                    <button
                      onClick={() => handleReject(res)}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 text-red-400 py-3 rounded-xl font-bold transition"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(res)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
