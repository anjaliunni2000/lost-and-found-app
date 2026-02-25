import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH ITEM =================
  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (!id) return;

        const docRef = doc(db, "items", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Failed to fetch item", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // ================= IMAGE RESOLVER =================
  const getImageSrc = () => {
    if (!item) return "/placeholder.png";

    // 1️⃣ Base64 Preview (Lost report upload)
    if (item.imagePreview) return item.imagePreview;

    // 2️⃣ Flask backend stored image
    if (item.file) {
      return `http://localhost:5000/database/${item.file}`;
    }

    // 3️⃣ Old image field fallback
    if (item.image) return item.image;

    // 4️⃣ Default placeholder
    return "/placeholder.png";
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading item...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Item not found
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Header />

      <main className="pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">

         {/* IMAGE */}
<div className="w-full flex justify-center mb-8">

  <div className="w-full max-w-lg h-72 rounded-2xl overflow-hidden bg-slate-800">
    {item.imagePreview ? (
      <img
        src={item.imagePreview}
        alt={item.title}
        className="w-full h-full object-contain"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        No Image
      </div>
    )}
  </div>

</div>


          {/* TITLE */}
          <h1 className="text-4xl font-bold mb-3">
            {item.title || item.itemName || "Unknown Item"}
          </h1>

          {/* DESCRIPTION */}
          <p className="text-slate-300 mb-6">
            {item.description || "No description provided"}
          </p>

          {/* DETAILS GRID */}
          <div className="grid md:grid-cols-2 gap-6 text-sm">

            <div className="bg-slate-900 p-5 rounded-2xl">
              <p className="text-slate-400">📍 Location</p>
              <p className="text-lg">{item.location || "N/A"}</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl">
              <p className="text-slate-400">🏷 Category</p>
              <p className="text-lg">{item.category || "N/A"}</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl">
              <p className="text-slate-400">📅 Date</p>
              <p className="text-lg">{item.date || "N/A"}</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl">
              <p className="text-slate-400">📌 Status</p>
              <p
                className={`text-lg font-semibold ${
                  item.status === "lost"
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {item.status || "N/A"}
              </p>
            </div>

          </div>

          {/* CONTACT */}
          <div className="bg-slate-900 p-6 rounded-2xl mt-8">
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>

            <p>📧 {item.contactEmail || "N/A"}</p>
            <p>📞 {item.contactPhone || "N/A"}</p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
