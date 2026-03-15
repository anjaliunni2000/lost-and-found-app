import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminFeedback() {

  const navigate = useNavigate();

  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {

    setLoading(true);

    const snap = await getDocs(collection(db, "feedback"));

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setFeedback(data);

    setLoading(false);
  }

  async function deleteFeedback(id: string) {

    if (!confirm("Delete this feedback?")) return;

    await deleteDoc(doc(db, "feedback", id));

    loadFeedback();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020617] text-white">
        Loading Feedback...
      </div>
    );
  }

  return (

    <div className="flex bg-[#020617] min-h-screen text-white">

      <AdminSidebar />

      <div className="flex-1 p-10">

        <button
          onClick={() => navigate("/admin")}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded mb-6"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-8">
          User Feedback
        </h1>

        <div className="bg-black/40 rounded-lg p-6">

          {feedback.map(fb => (

            <div
              key={fb.id}
              className="border-b border-slate-800 py-4 flex justify-between"
            >

              <div>

                <p className="text-emerald-400 font-semibold">
                  {fb.userEmail || "Unknown User"}
                </p>

                <p className="text-yellow-400">
                  {fb.rating} ⭐
                </p>

                <p className="text-gray-300 mt-1">
                  {fb.comment}
                </p>

              </div>

              <button
                onClick={() => deleteFeedback(fb.id)}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
              >
                Delete
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
}