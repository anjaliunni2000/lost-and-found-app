import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Search, AlignLeft, Sparkles, Image as ImageIcon, ChevronRight, Target, AlertCircle } from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
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

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/match`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Match request failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("AI Match Result:", data);
      
      let results: MatchItem[] = Array.isArray(data.matches) ? data.matches : [];

      // Strict category filters for the demo
      const searchTitle = title.toLowerCase();
      if (searchTitle.includes("phone") || searchTitle.includes("mobile")) {
        results = results.filter((m) => m.title?.toLowerCase().includes("phone") || m.title?.toLowerCase().includes("mobile"));
      } else if (searchTitle.includes("laptop")) {
        results = results.filter((m) => m.title?.toLowerCase().includes("laptop"));
      }

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

      setMatches(sortedMatches.slice(0, 3));
    } catch (err) {
      console.error("Matching error:", err);
      alert("AI matching failed");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        {/* INPUT: TITLE */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="What did you lose? e.g. iPhone 14 Pro Max"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]"
          />
        </div>

        {/* INPUT: DESCRIPTION */}
        <div className="relative group">
          <div className="absolute top-3.5 left-0 pl-4 pointer-events-none">
            <AlignLeft className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
          </div>
          <textarea
            placeholder="Add specific details (color, case, marks)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder:text-slate-500 outline-none resize-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]"
          />
        </div>

        {/* DRAG AND DROP ZONE */}
        <motion.div
            whileHover={{ scale: 1.01 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer overflow-hidden border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              isDragging 
                ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]" 
                : preview ? "border-emerald-500/30 bg-slate-900/50" : "border-slate-700/50 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-900/50"
            }`}
        >
          {preview ? (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
              <div className="relative w-full max-h-48 rounded-lg overflow-hidden border border-slate-700/50 shadow-lg">
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto max-h-48 object-contain"
                />
              </div>
              <p className="mt-4 text-emerald-400 text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Change Image
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="mb-4 p-4 rounded-full bg-slate-800/80 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="text-slate-300 font-medium mb-1 text-lg">
                Drag & drop your item image here
              </p>
              <p className="text-slate-500 text-sm">
                or click to browse files
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </motion.div>
      </div>

      {/* MATCH BUTTON */}
      <motion.button
        whileHover={!loading ? { scale: 1.02, filter: "brightness(1.1)" } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        onClick={handleMatch}
        disabled={loading}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-black font-bold text-lg transition-all duration-300 ${
          loading
            ? "bg-slate-700 cursor-not-allowed text-slate-400"
            : "bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        }`}
      >
        {loading ? (
          <>
            <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
               className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"
            />
            Analyzing Data...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Find Matches
          </>
        )}
      </motion.button>

      {/* MATCH RESULTS SECTION */}
      <AnimatePresence>
        {matches.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xl font-bold text-white tracking-wide">AI Top Matches</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/40 to-transparent ml-2"></div>
            </div>

            {matches.map((match, index) => {
              const score = Number(match?.score ?? match?.confidence ?? 0);
              
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index} 
                  className="group relative rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-5 shadow-lg overflow-hidden backdrop-blur-md hover:border-emerald-400/50 transition-colors"
                >
                  {/* Subtle Background Glow behind cards */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row gap-5">
                     
                     {/* Image Placeholder Preview (if they exist) */}
                     {match.image || match.imageUrl || match.foundImage ? (
                       <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                          <img 
                            src={match.image || match.imageUrl || match.foundImage} 
                            alt={match.title}
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                       </div>
                     ) : (
                       <div className="h-24 w-24 shrink-0 rounded-xl bg-slate-800/50 flex flex-col items-center justify-center border border-slate-700/50">
                         <ImageIcon className="w-8 h-8 text-slate-600 mb-1" />
                         <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">No Img</span>
                       </div>
                     )}

                     {/* Match Content */}
                     <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-lg text-white mb-1 leading-tight group-hover:text-emerald-300 transition-colors">{match.title || "Unknown Item"}</h4>
                          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                            {match.description || "No specific details provided."}
                          </p>
                        </div>
                        
                        {/* Progress Bar Confidence */}
                        <div className="mt-4 flex items-center gap-3">
                           <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, delay: index * 0.2 + 0.3 }}
                                className={`h-full rounded-full ${score > 80 ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : score > 50 ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-amber-400'}`}
                             />
                           </div>
                           <span className="text-sm font-bold font-mono min-w-[3.5rem] text-right text-emerald-400">{score.toFixed(1)}%</span>
                        </div>
                     </div>
                  </div>

                  <div className="relative z-10 mt-5 flex gap-3">
                    <button
                      onClick={() => {
                        const itemId = match.foundItemId || match.itemId || match.id || match.lostItemId;
                        if (!itemId) { alert("Matched item id not found"); return; }
                        navigate(`/claim-item/${itemId}`, { state: { match: match } });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 py-2.5 font-semibold text-emerald-400 hover:bg-emerald-400 hover:text-black hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all duration-300 text-sm"
                    >
                       Confirm Item
                    </button>

                    <button
                      onClick={() => {
                        const itemId = match.foundItemId || match.itemId || match.id || match.lostItemId;
                        if (!itemId) { alert("Matched item id not found"); return; }
                        navigate(`/finder-details/${itemId}`, { state: { match: match } });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 py-2.5 font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-sm group/btn"
                    >
                      View Details <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {noMatchPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/80 backdrop-blur-sm"
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-slate-900 p-8 rounded-2xl text-center max-w-sm border border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
              
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 mb-4">
                 <AlertCircle className="h-8 w-8 text-rose-500" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">No Match Found</h2>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                Our AI couldn't find any highly confident matches in the current database.
              </p>

              <button
                onClick={() => setNoMatchPopup(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
              >
                 Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}