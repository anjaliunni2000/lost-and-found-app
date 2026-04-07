import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

import AdminSidebar from "@/components/AdminSidebar";
import { Activity, Users, Package, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [usersCount, setUsersCount] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);

  const [lostItems, setLostItems] = useState(0);
  const [foundItems, setFoundItems] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      // USERS
      const usersSnap = await getDocs(collection(db, "users"));
      setUsersCount(usersSnap.docs.length);

      // ITEMS
      const itemsSnap = await getDocs(collection(db, "items"));
      const itemsData = itemsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as any[];

      setItemsCount(itemsData.length);
      setLostItems(itemsData.filter(i => i.status === "lost").length);
      setFoundItems(itemsData.filter(i => i.status === "found").length);

    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err);
    }
    setLoading(false);
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex bg-[#030712] min-h-screen text-white">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
           <div className="relative flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
             <p className="text-emerald-400 font-medium animate-pulse tracking-widest uppercase">Connecting to Database...</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#030712] min-h-screen text-white relative overflow-hidden">

      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#334155_1px,transparent_0)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 md:p-12 z-10 overflow-y-auto">

        {/* HEADER */}
        <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="flex justify-between items-center mb-12 border-b border-slate-800/80 pb-6"
        >
          <div>
             <h1 className="text-4xl font-sans font-bold tracking-tight text-white mb-2">
               Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Center</span>
             </h1>
             <p className="text-slate-400 flex items-center gap-2">
               <Activity className="w-4 h-4 text-emerald-400" /> System running optimally. Platform metrics live.
             </p>
          </div>
        </motion.div>

        {/* METRICS GRID */}
        <motion.div 
           variants={containerVariants}
           initial="hidden"
           animate="show"
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >

          <StatCard
            variants={cardVariants}
            title="Total Inventory Base"
            value={itemsCount}
            colorTheme="blue"
            icon={<Package className="w-7 h-7" />}
            trend="+12%"
          />

          <StatCard
            variants={cardVariants}
            title="Registered Accounts"
            value={usersCount}
            colorTheme="emerald"
            icon={<Users className="w-7 h-7" />}
            trend="+5%"
          />

          <StatCard
            variants={cardVariants}
            title="Active Lost Reports"
            value={lostItems}
            colorTheme="rose"
            icon={<AlertTriangle className="w-7 h-7" />}
            trend="-3%"
          />

          <StatCard
            variants={cardVariants}
            title="Items Successfully Found"
            value={foundItems}
            colorTheme="purple"
            icon={<CheckCircle className="w-7 h-7" />}
            trend="+24%"
          />

        </motion.div>

      </div>
    </div>
  );
}

/* ================= PREMIUM STAT CARD ================= */

function StatCard({ title, value, colorTheme, icon, variants, trend }: any) {
  
  // Dynamic color assignments based on theme
  const themeStyles: Record<string, string> = {
    blue: "from-blue-500/20 to-cyan-500/5 border-blue-500/30 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    emerald: "from-emerald-500/20 to-teal-500/5 border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    rose: "from-rose-500/20 to-orange-500/5 border-rose-500/30 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    purple: "from-purple-500/20 to-indigo-500/5 border-purple-500/30 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
  };

  const currentTheme = themeStyles[colorTheme] || themeStyles.blue;

  return (
    <motion.div 
       variants={variants}
       className={`relative bg-slate-900/40 backdrop-blur-xl border rounded-[2rem] p-8 overflow-hidden group hover:-translate-y-1 transition-transform duration-500 ${currentTheme}`}
    >
      {/* Background Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none ${currentTheme.split(' ')[0]} ${currentTheme.split(' ')[1]}`} />
      
      {/* Glowing Icon Top Right */}
      <div className="absolute top-6 right-6 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
         {icon}
      </div>

      <div className="relative z-10">
        <h3 className="text-slate-400 font-semibold tracking-wide text-sm mb-4 uppercase">
          {title}
        </h3>
        
        <div className="flex items-end gap-4">
           <span className="text-5xl font-bold tracking-tight text-white drop-shadow-md">
             {value}
           </span>
           <span className={`text-sm font-medium flex items-center gap-1 mb-1 px-2.5 py-1 rounded-lg bg-slate-900/50 backdrop-blur-md`}>
             <TrendingUp className="w-3 h-3" /> {trend}
           </span>
        </div>
      </div>
    </motion.div>
  );
}