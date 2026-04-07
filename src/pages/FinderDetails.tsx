import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { db, storage } from "@/lib/firebase";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Info, 
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Tag
} from "lucide-react";

type FinderItem = {
  id?: string;
  title?: string;
  itemName?: string;
  name?: string;
  description?: string;
  details?: string;
  foundLocation?: string;
  location?: string;
  place?: string;
  finderEmail?: string;
  email?: string;
  contactEmail?: string;
  finderPhone?: string;
  phone?: string;
  contactPhone?: string;
  mobile?: string;
  image?: string;
  imageUrl?: string;
  photoURL?: string;
  foundImage?: string;
  foundDate?: string;
  date?: string;
  createdAt?: string;
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
  const [imageError, setImageError] = useState(false);

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
              ...(docSnap.data() as Omit<FinderItem, "id">),
            };
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
          rawImage.startsWith("data:") ||
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
        setResolvedImage(rawImage);
      }
    };

    resolveImageUrl();
  }, [item]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
           className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] text-white">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center max-w-sm"
        >
          <XCircle className="w-16 h-16 text-rose-500 mb-4" />
          <p className="text-2xl font-bold mb-2">Item Not Found</p>
          <p className="text-slate-400 text-center mb-6">We couldn't locate this item. It may have been deleted.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const itemTitle = item.title || item.itemName || item.name || "Unknown Item";
  const itemDescription = item.description || item.details || "No details provided.";
  const itemLocation = item.foundLocation || item.location || item.place || "Unspecified Location";
  const itemEmail = item.finderEmail || item.email || item.contactEmail || "No Email Provided";
  const itemPhone = item.finderPhone || item.phone || item.contactPhone || item.mobile || "No Phone Provided";
  const itemDate = item.foundDate || item.date || item.createdAt || "Unknown Date";

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-white overflow-hidden py-24 px-4 sm:px-6">
      
      {/* AMBIENT GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-5xl relative z-10">
        
        {/* HEADER BAR */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center justify-between"
        >
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
           >
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             <span>Back to Matches</span>
           </button>
           
           <div className="px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]">
             <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Match Profile</span>
           </div>
        </motion.div>

        {/* MAIN CONTENT CARD */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="rounded-[2.5rem] border border-emerald-500/20 bg-slate-900/60 p-6 sm:p-10 shadow-[0_0_50px_-15px_rgba(16,185,129,0.15)] backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* LEFT COLUMN: IMAGE */}
            <motion.div variants={itemVariants} className="flex flex-col h-full space-y-4">
               <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-[2rem] overflow-hidden border border-slate-700/50 bg-slate-950/50 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                 {resolvedImage && !imageError ? (
                    <>
                      <img
                        src={resolvedImage}
                        alt={itemTitle}
                        className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImageError(true)}
                      />
                      <div className="absolute inset-0 border-[3px] border-emerald-500/10 rounded-[2rem] pointer-events-none mix-blend-overlay"></div>
                    </>
                  ) : imageError && resolvedImage ? (
                    <div className="flex w-full h-full flex-col items-center justify-center text-center p-8 border-2 border-dashed border-rose-500/30">
                      <XCircle className="w-12 h-12 text-rose-500/70 mb-3" />
                      <p className="text-rose-400 font-semibold mb-2">Image Lost</p>
                      <p className="text-sm text-slate-500 mb-4 max-w-[250px]">The server link appears to be broken. </p>
                      <a href={resolvedImage} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 break-all underline bg-blue-500/10 p-2 rounded-lg">
                        Verify Direct Link
                      </a>
                    </div>
                  ) : (
                    <div className="flex w-full h-full flex-col items-center justify-center text-slate-500">
                      <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                      <p className="font-medium tracking-wide">No Primary Image</p>
                    </div>
                  )}
               </div>

               {/* QUICK STAT (Optional) */}
               <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 flex items-center gap-4">
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                     <Calendar className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Date Reported</p>
                    <p className="text-sm font-medium text-slate-200 mt-0.5">{itemDate}</p>
                  </div>
               </div>
            </motion.div>

            {/* RIGHT COLUMN: DETAILS & ACTIONS */}
            <div className="flex flex-col h-full flex-grow">
              <motion.div variants={itemVariants} className="mb-6 flex-grow">
                 
                 <div className="mb-8">
                   <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 leading-tight mb-2">
                     {itemTitle}
                   </h1>
                 </div>

                 <div className="space-y-6">
                    {/* INFO BLOCK: Desc */}
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30 hover:bg-slate-800/40 transition-colors">
                       <div className="mt-1 bg-slate-700/40 p-2 rounded-lg text-slate-400 shrink-0">
                         <Info className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                         <p className="text-slate-200 leading-relaxed text-[15px]">{itemDescription}</p>
                       </div>
                    </div>

                    {/* INFO BLOCK: Location */}
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30 hover:bg-slate-800/40 transition-colors">
                       <div className="mt-1 bg-slate-700/40 p-2 rounded-lg text-cyan-400 shrink-0">
                         <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Found Location</p>
                         <p className="text-slate-200 leading-relaxed font-medium">{itemLocation}</p>
                       </div>
                    </div>

                    {/* TWO-COLUMN CONTACT BLOCK */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30">
                          <div className="bg-slate-700/40 p-2 rounded-lg text-emerald-400 shrink-0">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Contact Email</p>
                            <p className="text-sm text-slate-200 truncate">{itemEmail}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30">
                          <div className="bg-slate-700/40 p-2 rounded-lg text-emerald-400 shrink-0">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Contact Phone</p>
                            <p className="text-sm text-slate-200 truncate">{itemPhone}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>

              {/* ACTION BUTTONS */}
              <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() =>
                    navigate(`/claim-item/${item.id || id}`, {
                      state: { item, image: resolvedImage },
                    })
                  }
                  className="flex-1 group relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-4 font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300"
                >
                  <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Yes, This Is My Item</span>
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="sm:w-[160px] flex justify-center items-center gap-2 rounded-2xl bg-slate-800/80 border border-slate-700 px-6 py-4 font-semibold text-slate-300 hover:bg-slate-700 hover:text-white hover:-translate-y-1 transition-all duration-300"
                >
                  <XCircle className="w-5 h-5 text-slate-500 group-hover:text-rose-400 transition-colors" />
                  Not My Item
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}