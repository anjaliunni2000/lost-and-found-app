import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { db, storage } from "@/lib/firebase";

type FinderItem = {
  id?: string;
  title?: string;
  description?: string;
  foundLocation?: string;
  location?: string;
  finderEmail?: string;
  email?: string;
  finderPhone?: string;
  phone?: string;
  image?: string;
  imageUrl?: string;
  photoURL?: string;
  foundImage?: string;
  foundDate?: string;
  date?: string;
};

export default function FinderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = location.state as { match?: FinderItem } | null;
  const matchFromState = stateData?.match || null;

  const [item, setItem] = useState<FinderItem | null>(matchFromState);
  const [loading, setLoading] = useState(!matchFromState);
  const [resolvedImage, setResolvedImage] = useState<string>("");

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      if (matchFromState) {
        setLoading(false);
        return;
      }

      try {
        const collectionsToTry = ["found_items", "foundItems"];

        let foundItem: FinderItem | null = null;

        for (const collectionName of collectionsToTry) {
          const docRef = doc(db, collectionName, id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            foundItem = {
              id: docSnap.id,
              ...docSnap.data(),
            } as FinderItem;
            break;
          }
        }

        setItem(foundItem);
      } catch (error) {
        console.error("Error fetching finder details:", error);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, matchFromState]);

  useEffect(() => {
    const resolveImageUrl = async () => {
      if (!item) {
        setResolvedImage("");
        return;
      }

      const rawImage =
        item.image ||
        item.imageUrl ||
        item.photoURL ||
        item.foundImage ||
        "";

      if (!rawImage) {
        setResolvedImage("");
        return;
      }

      try {
        if (
          rawImage.startsWith("http://") ||
          rawImage.startsWith("https://") ||
          rawImage.startsWith("blob:")
        ) {
          setResolvedImage(rawImage);
          return;
        }

        const imageRef = ref(storage, rawImage);
        const downloadURL = await getDownloadURL(imageRef);
        setResolvedImage(downloadURL);
      } catch (error) {
        console.error("Could not resolve Firebase image URL:", rawImage, error);
        setResolvedImage("");
      }
    };

    resolveImageUrl();
  }, [item]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <p className="text-lg">Loading finder details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <p className="text-2xl font-semibold">Item not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-slate-700 px-6 py-3 text-white hover:bg-slate-600"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-[30px] border border-cyan-400/20 bg-[#0b1530] p-8 shadow-lg">
        <h1 className="mb-8 text-4xl font-bold text-emerald-400">
          Item Found Details
        </h1>

        {/* {resolvedImage ? (
          <img
            src={resolvedImage}
            alt={item.title || "Found item"}
            className="mb-8 h-72 w-full rounded-2xl object-cover"
            onError={() => {
              console.log("Image failed to load:", resolvedImage);
              setResolvedImage("");
            }}
          />
        ) : (
          <div className="mb-8 flex h-72 w-full items-center justify-center rounded-2xl bg-slate-800 text-gray-400">
            No image available
          </div>
        )} */}

        <div className="space-y-4">
          <p className="text-2xl font-semibold">
            Item: {item.title || "No title"}
          </p>

          <p className="text-xl text-gray-300">
            Description: {item.description || "No description"}
          </p>

          <p className="text-xl text-gray-300">
            Found Location: {item.foundLocation || item.location || "Not available"}
          </p>

          <p className="text-xl text-gray-300">
            Finder Email: {item.finderEmail || item.email || "Not available"}
          </p>

          <p className="text-xl text-gray-300">
            Finder Phone: {item.finderPhone || item.phone || "Not available"}
          </p>

          <p className="text-xl text-gray-300">
            Found Date: {item.foundDate || item.date || "Not available"}
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() =>
              navigate(`/claim-item/${item.id || id}`, {
                state: { item, image: resolvedImage },
              })
            }
            className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black hover:bg-emerald-500"
          >
            I Found My Item
          </button>

          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-600"
          >
            Not My Item
          </button>
        </div>
      </div>
    </div>
  );
}