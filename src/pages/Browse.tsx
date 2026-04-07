import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";

export default function Browse() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const [lostSnap, foundSnap] = await Promise.all([
        getDocs(collection(db, "items")),
        getDocs(collection(db, "found_items"))
      ]);

      const lostData = lostSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      const foundData = foundSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      const allItems = [...lostData, ...foundData].sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setItems(allItems);
    } catch (err) {
      console.error("Error loading items:", err);
    }
  }

  const getImageSrc = (item: any) => {
    if (item?.imageUrl) return item.imageUrl;
    if (item?.imagePreview) return item.imagePreview;
    if (item?.image) return item.image;
    if (item?.photoData) return item.photoData;
    return "/placeholder.svg";
  };

  const filtered = items.filter((item:any) => {
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-white relative flex flex-col pt-28 pb-16 overflow-hidden">
      
      {/* GLOBAL HEADER */}
      <Header />

      {/* AMBIENT EFFECTS */}
      <div className="absolute top-[0%] right-[0%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[0%] left-[0%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#334155_1px,transparent_0)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 flex-1 flex flex-col max-w-7xl">

        {/* PAGE TITLE */}
        <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight mb-4">
            Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Database</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-[15px] leading-relaxed">
            Search through thousands of correctly logged items, or filter by your specific objective using our advanced finding ecosystem.
          </p>
        </motion.div>

        {/* SEARCH + FILTER BARS */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2, duration: 0.4 }}
           className="flex flex-col md:flex-row gap-4 mb-12 lg:mb-16 max-w-3xl mx-auto w-full"
        >
          {/* Frosted Glass Search Box */}
          <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-xl px-5 py-4 rounded-xl flex-1 border border-slate-700/50 shadow-inner focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all group">
            <Search size={20} className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              placeholder="Search items by name, model, color..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-white placeholder:text-slate-500 text-[15px]"
            />
          </div>

          {/* Frosted Glass Select */}
          <div className="relative">
             <select
               value={filter}
               onChange={(e)=>setFilter(e.target.value)}
               className="appearance-none w-full md:w-[160px] bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 text-slate-300 font-semibold px-5 py-4 rounded-xl shadow-inner outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer"
             >
               <option value="all">All Items</option>
               <option value="lost">Lost</option>
               <option value="found">Found</option>
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
          </div>
        </motion.div>


        {/* ITEM GRID */}
        {filtered.length > 0 ? (
          <div 
             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          >
            {filtered.map((item:any, index:number)=>(
              <motion.div 
                   key={item.id} 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: index * 0.08, type: "spring", stiffness: 300, damping: 24 }}
              >
                  <Link
                    to={`/item/${item.id}`}
                    className="group block bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-800/60 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_10px_40px_-20px_rgba(16,185,129,0.3)] hover:-translate-y-1"
                  >
                    <div className="h-[220px] overflow-hidden relative">
                      <img
                        src={getImageSrc(item)}
                        alt={item.title || "Item Image"}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      
                      {/* Dark Gradient Overlay Bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>

                      {/* Glowing Status Badge */}
                      <div className={`absolute top-4 left-4 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest backdrop-blur-md border ${
                          item.status === "lost"
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        }`}
                      >
                        {item.status}
                      </div>

                      {/* Title & Location Overlay inside image container for premium look */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-[17px] font-bold text-white mb-1 truncate drop-shadow-md group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-400 text-[13px] truncate font-medium drop-shadow-sm flex items-center gap-1.5">
                          {item.location}
                        </p>
                      </div>
                    </div>
                  </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex-1 flex flex-col items-center justify-center text-center mt-6 mb-20"
          >
             <div className="w-24 h-24 bg-slate-900/50 backdrop-blur-xl rounded-full border border-slate-800 flex items-center justify-center mb-6 shadow-2xl">
                 <Search size={32} className="text-slate-500" />
             </div>
             <h3 className="text-xl font-semibold text-white mb-2">No Items Found</h3>
             <p className="text-slate-400 max-w-sm">
                 We couldn't find any items matching your current search or filters. Try adjusting your keywords.
             </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}