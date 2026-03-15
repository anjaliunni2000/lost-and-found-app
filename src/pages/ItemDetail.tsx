import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ItemDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

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

    if (item?.imageUrl) return item.imageUrl;

    if (item?.imagePreview) return item.imagePreview;

    if (item?.image) return item.image;

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

        <div className="max-w-3xl mx-auto bg-slate-900 p-8 rounded-2xl">

          {/* IMAGE */}

          <img
            src={getImageSrc()}
            alt={item.title}
            className="w-full h-64 object-cover rounded-xl mb-6"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />

          {/* TITLE */}

          <h1 className="text-3xl font-bold mb-2">
            {item.title || "Unknown Item"}
          </h1>

          {/* DESCRIPTION */}

          <p className="text-gray-300 mb-6">
            {item.description || "No description provided"}
          </p>

          {/* FOUND DETAILS */}

          <div className="space-y-3 text-gray-300">

            <p className="text-gray-400 mt-2">
              📍 Found Location: {item.location || "Unknown"}
            </p>

            <p className="text-gray-400 mt-2">
              📅 Found Date: {item.date || "Unknown"}
            </p>

            {item.score && (
              <p className="text-emerald-400 font-semibold">
                AI Confidence: {item.score}%
              </p>
            )}

          </div>

          {/* BUTTONS */}

          <div className="flex gap-4 mt-8">

           <button
  onClick={() => {
    if (!item?.id) {
      console.error("Item ID missing:", item);
      return;
    }

    navigate(`/finder-details/${item.id}`);
  }}
  className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-black py-3 rounded-xl font-semibold"
>
  My Item Found
</button>

            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-semibold"
            >
              Not My Item
            </button>

          </div>

        </div>

      </main>

      <Footer />

    </div>

  );

}