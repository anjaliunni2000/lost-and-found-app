import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Camera, CheckCircle } from "lucide-react";
import { compressImage } from "../utils/imageUtils";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ItemDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionPhoto, setResolutionPhoto] = useState<string | null>(null);
  const [resolutionMessage, setResolutionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================= RESOLUTION HANDLERS =================
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const base64 = await compressImage(e.target.files[0], 800);
      setResolutionPhoto(base64 as string);
    } catch (err) {
      toast.error("Failed to load image");
    }
  };

  const submitResolution = async () => {
    if (!user) return toast.error("Please login first.");
    if (!resolutionPhoto) return toast.error("Victory photo is required!");

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "resolutions"), {
        itemId: item.id,
        itemTitle: item.title || "Unknown Item",
        claimerId: user.uid,
        claimerEmail: user.email || "Unknown",
        finderId: item.userId || null,
        photoData: resolutionPhoto,
        message: resolutionMessage.trim(),
        status: "pending_admin",
        createdAt: serverTimestamp(),
      });
      toast.success("Victory Photo sent to Admin for Review! 🎉");
      setShowResolutionModal(false);
    } catch (err) {
      toast.error("Failed to submit resolution");
    }
    setIsSubmitting(false);
  };

  // ================= FETCH ITEM =================

  useEffect(() => {

    const fetchItem = async () => {

      try {

        if (!id) return;

        const docRef = doc(db, "items", id);
        let snap = await getDoc(docRef);

        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        } else {
          // Fallback to found_items collection
          const foundRef = doc(db, "found_items", id);
          const foundSnap = await getDoc(foundRef);
          if (foundSnap.exists()) {
            setItem({ id: foundSnap.id, ...foundSnap.data() });
          }
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

    if (!item) return "/placeholder.svg";

    if (item?.imageUrl) return item.imageUrl;

    if (item?.imagePreview) return item.imagePreview;

    if (item?.image) return item.image;

    if (item?.photoData) return item.photoData;

    return "/placeholder.svg";
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
              (e.target as HTMLImageElement).src = "/placeholder.svg";
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

          <button
            onClick={() => setShowResolutionModal(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 outline-none text-white py-3 rounded-xl font-bold mt-4 transition flex items-center justify-center gap-2"
          >
            <Camera size={20} /> I Got My Item Back!
          </button>

        </div>

      </main>

      <Footer />

      {/* RESOLUTION MODAL */}
      {showResolutionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-blue-500/30 rounded-3xl p-8 text-white shadow-2xl">
            
            <div className="flex justify-center mb-4">
              <div className="bg-blue-500/20 p-4 rounded-full">
                <CheckCircle className="w-10 h-10 text-blue-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-blue-400 mb-2">Claim Victory!</h2>
            <p className="text-center text-sm text-gray-400 mb-6">
              Upload a photo of you retrieving the item to officially close out this case! Admins will review the photo to mark it resolved.
            </p>

            <label className="block w-full border-2 border-dashed border-slate-700 bg-slate-800 hover:bg-slate-700/50 transition cursor-pointer rounded-2xl p-6 text-center mb-4">
              {resolutionPhoto ? (
                <img src={resolutionPhoto} alt="Victory" className="h-40 w-full object-cover rounded-xl" />
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-10 h-10 text-slate-500 mb-2" />
                  <span className="text-slate-400 font-semibold">Upload Victory Photo</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>

            <textarea
              placeholder="Leave a short thank you note or comment (optional)"
              value={resolutionMessage}
              onChange={(e) => setResolutionMessage(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-xl p-4 text-white placeholder-slate-500 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={submitResolution}
                disabled={isSubmitting || !resolutionPhoto}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
              >
                {isSubmitting ? "Sending..." : "Submit to Admin"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>

  );

}