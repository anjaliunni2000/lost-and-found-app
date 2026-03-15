import { useState } from "react";
import { useNavigate } from "react-router-dom";

type MatchItem = {
  id?: string;
  itemId?: string;
  lostItemId?: string;
  foundItemId?: string;
  finderId?: string;
  title?: string;
  description?: string;
  score?: number;
  confidence?: number;
  image?: string;
  imageUrl?: string;
  photoURL?: string;
  foundImage?: string;
  foundLocation?: string;
  location?: string;
  finderEmail?: string;
  email?: string;
  finderPhone?: string;
  phone?: string;
};

export default function AIMatchHome() {
  const navigate = useNavigate();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [noMatchPopup, setNoMatchPopup] = useState(false);

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleMatch = async () => {
    if (!image && !title.trim() && !description.trim()) {
      alert("Please upload image or enter details");
      return;
    }

    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("title", title.trim());
    formData.append("description", description.trim());

    try {
      setLoading(true);
      setNoMatchPopup(false);
      setMatches([]);

      const res = await fetch("http://127.0.0.1:8000/match", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Match request failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("AI Match Result:", data);
      console.log("Matches array:", data.matches);

      const results: MatchItem[] = Array.isArray(data.matches) ? data.matches : [];

      if (results.length === 0) {
        setMatches([]);
        setNoMatchPopup(true);
        return;
      }

      const sortedMatches = [...results].sort(
        (a, b) =>
          Number(b.score ?? b.confidence ?? 0) -
          Number(a.score ?? a.confidence ?? 0)
      );

      setMatches(sortedMatches.slice(0, 1));
    } catch (err) {
      console.error("Matching error:", err);
      alert("AI matching failed");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const topMatch = matches[0];
  const topMatchScore = Number(topMatch?.score ?? topMatch?.confidence ?? 0);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      <input
        type="text"
        placeholder="Item name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none"
      />

      <textarea
        placeholder="Describe your lost item"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none resize-none"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center"
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mx-auto mb-3 max-h-40 rounded-lg object-contain"
          />
        ) : (
          <p className="text-gray-400">Drag & drop image here or choose file</p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="mt-3 text-white"
        />
      </div>

      <button
        onClick={handleMatch}
        disabled={loading}
        className={`py-3 rounded-xl text-black font-semibold transition ${
          loading
            ? "bg-slate-500 cursor-not-allowed"
            : "bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90"
        }`}
      >
        {loading ? "AI Matching..." : "Upload & Match"}
      </button>

      {topMatch && (
        <div className="mt-4 space-y-3">
          <h3 className="text-lg font-bold text-emerald-400">Possible Match</h3>

          <div className="rounded-lg border border-emerald-400/20 bg-slate-900 p-4">
            <p className="font-semibold text-white">{topMatch.title || "No title"}</p>

            <p className="mt-2 text-sm text-gray-400">
              {topMatch.description || "No description"}
            </p>

            <p className="mt-3 font-semibold text-emerald-400">
              Confidence: {topMatchScore.toFixed(2)}%
            </p>

            <button
              onClick={() => {
                const itemId =
                  topMatch.foundItemId ||
                  topMatch.itemId ||
                  topMatch.id ||
                  topMatch.lostItemId;

                console.log("TOP MATCH ITEM:", topMatch);
                console.log("Navigating with itemId:", itemId);

                if (!itemId) {
                  alert("Matched item id not found");
                  return;
                }

                navigate(`/finder-details/${itemId}`, {
                  state: {
                    match: topMatch,
                  },
                });
              }}
              className="mt-4 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-black hover:bg-emerald-500"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {noMatchPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 p-6 rounded-xl text-center max-w-sm border border-red-400/30">
            <h2 className="text-xl font-bold text-red-400 mb-2">No Match Found</h2>

            <p className="text-gray-400 mb-4">
              We couldn't find any similar items.
            </p>

            <button
              onClick={() => setNoMatchPopup(false)}
              className="px-4 py-2 bg-emerald-400 text-black rounded-lg font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}