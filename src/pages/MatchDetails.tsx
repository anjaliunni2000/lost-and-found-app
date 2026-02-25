import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MatchDetails = () => {

  const { matchId } = useParams<{ matchId: string }>();

  const [lostItem, setLostItem] = useState<any>(null);
  const [foundItem, setFoundItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);

  useEffect(() => {
    if (!matchId) {
      setError("Invalid match ID");
      setLoading(false);
      return;
    }

    loadData();
  }, [matchId]);

  // ================= LOAD DATA =================
  const loadData = async () => {

    try {

      const matchSnap = await getDoc(doc(db, "matches", matchId!));

      if (!matchSnap.exists()) {
        setError("Match not found");
        return;
      }

      const matchData = matchSnap.data();

      console.log("MATCH DATA:", matchData);

      const lostId = matchData?.lostItemId;
      const foundId = matchData?.foundItemId;

      if (!lostId || !foundId) {
        setError("Match missing item references");
        return;
      }

      const lostSnap = await getDoc(doc(db, "items", lostId));
      if (lostSnap.exists()) setLostItem(lostSnap.data());

      const foundSnap = await getDoc(doc(db, "items", foundId));
      if (foundSnap.exists()) setFoundItem(foundSnap.data());

    } catch (err) {
      console.error("MatchDetails Error:", err);
      setError("Failed to load match details");
    } finally {
      setLoading(false);
    }
  };

  // ================= IMAGE HELPER =================
  const getImage = (item: any) => {

  if (!item) return null;

  const BASE_URL = "http://localhost:5000";

  // Base64 preview (most common in your app)
  if (item.imagePreview) return item.imagePreview;

  if (item.imagePreviews?.length > 0)
    return item.imagePreviews[0];

  // Direct base64
  if (item.image && item.image.startsWith("data:image"))
    return item.image;

  // Backend stored files
  if (item.files?.length > 0)
    return `${BASE_URL}/database/${item.files[0]}`;

  if (item.image)
    return `${BASE_URL}/database/${item.image}`;

  return null;
};
  // ================= CONTACT FUNCTIONS =================

  const contactByEmail = () => {

    if (!foundItem?.contactEmail) return;

    const subject = encodeURIComponent("Regarding Lost Item Match");
    const body = encodeURIComponent(
      `Hello,\n\nI believe the item "${lostItem?.title}" belongs to me.\n\nThank you.`
    );

    window.location.href =
      `mailto:${foundItem.contactEmail}?subject=${subject}&body=${body}`;
  };

  const contactByWhatsApp = () => {

    if (!foundItem?.contactPhone) return;

    const message = encodeURIComponent(
      `Hello, I believe the item "${lostItem?.title}" belongs to me.`
    );

    const phone = foundItem.contactPhone.replace(/\D/g, "");

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  // ================= UI STATES =================

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading match details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-400">
        {error}
      </div>
    );
  }

  if (!lostItem || !foundItem) {
    return (
      <div className="p-10 text-white">
        Match data not found.
      </div>
    );
  }

  // ================= MAIN UI =================
  return (
    <div className="p-10 text-white">

      <h1 className="text-3xl mb-8 font-bold">
        Match Details
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LOST ITEM */}
        <div className="bg-slate-800 p-6 rounded-xl">

          <h2 className="text-red-400 mb-4 text-xl font-semibold">
            Lost Item
          </h2>

          {getImage(lostItem) && (
            <img
              src={getImage(lostItem)!}
              className="rounded-xl mb-4 w-full h-64 object-cover"
              alt="Lost Item"
            />
          )}

          <p><b>Name:</b> {lostItem.title || "N/A"}</p>
          <p><b>Location:</b> {lostItem.location || "N/A"}</p>
          <p><b>Date:</b> {lostItem.date || "N/A"}</p>

        </div>

        {/* FOUND ITEM */}
        <div className="bg-slate-800 p-6 rounded-xl">

          <h2 className="text-green-400 mb-4 text-xl font-semibold">
            Found Item
          </h2>

          {getImage(foundItem) && (
            <img
              src={getImage(foundItem)!}
              className="rounded-xl mb-4 w-full h-64 object-cover"
              alt="Found Item"
            />
          )}

          <p><b>Name:</b> {foundItem.title || "N/A"}</p>
          <p><b>Location:</b> {foundItem.location || "N/A"}</p>
          <p><b>Date:</b> {foundItem.date || "N/A"}</p>

          {/* 🔒 CONTACT BUTTON */}
          <button
            onClick={() => setShowContactPopup(true)}
            className="mt-6 bg-cyan-500 hover:bg-cyan-400 px-6 py-2 rounded-lg font-semibold text-black"
          >
            🔒 Contact Finder
          </button>

        </div>

      </div>

      {/* ================= SECURE CONTACT POPUP ================= */}

      {showContactPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-slate-900 p-8 rounded-2xl max-w-md w-full text-center border border-cyan-500/30">

            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Contact Finder
            </h2>

            <p className="text-slate-300 mb-6">
              Choose how you would like to contact the finder.
            </p>

            <div className="flex flex-col gap-4">

              <button
                onClick={contactByEmail}
                className="bg-blue-500 px-4 py-2 rounded-lg font-semibold"
              >
                📧 Contact via Email
              </button>

              <button
                onClick={contactByWhatsApp}
                className="bg-green-500 px-4 py-2 rounded-lg font-semibold"
              >
                💬 Contact via WhatsApp
              </button>

              <button
                onClick={() => setShowContactPopup(false)}
                className="bg-gray-600 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default MatchDetails;
