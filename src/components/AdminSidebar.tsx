import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  LayoutDashboard,
  Users,
  Package,
  Brain,
  MessageSquare,
  LogOut,
  Camera,
  ShieldAlert
} from "lucide-react";

export default function AdminSidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group
    ${
      location.pathname === path
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        : "text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-white"
    }`;

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <div className="w-72 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/80 min-h-screen flex flex-col relative z-20">

      {/* Brand Header */}
      <div className="h-24 flex items-center px-8 border-b border-slate-800/80 mb-6">
        <Link to="/" className="flex items-center gap-2 group">
           <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
             <ShieldAlert className="w-5 h-5 text-emerald-400" />
           </div>
           <span className="text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
             Admin<span className="text-emerald-400">OS</span>
           </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">

        <Link to="/admin" className={linkClass("/admin")}>
          <LayoutDashboard className={`w-5 h-5 ${location.pathname==="/admin" ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`}/>
          Overview
        </Link>

        <Link to="/admin/users" className={linkClass("/admin/users")}>
          <Users className={`w-5 h-5 ${location.pathname==="/admin/users" ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`}/>
          Accounts
        </Link>

        <Link to="/admin/items" className={linkClass("/admin/items")}>
          <Package className={`w-5 h-5 ${location.pathname==="/admin/items" ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`}/>
          Inventory Base
        </Link>

        <Link to="/admin/resolutions" className={linkClass("/admin/resolutions")}>
          <Camera className={`w-5 h-5 ${location.pathname==="/admin/resolutions" ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`}/>
          Resolutions
        </Link>

        <Link to="/admin/matches" className={linkClass("/admin/matches")}>
          <Brain className={`w-5 h-5 ${location.pathname==="/admin/matches" ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`}/>
          AI Engine
        </Link>

        <Link to="/admin/feedback" className={linkClass("/admin/feedback")}>
          <MessageSquare className={`w-5 h-5 ${location.pathname==="/admin/feedback" ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`}/>
          User Feedback
        </Link>

      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800/80 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-3.5 rounded-xl transition-all duration-300 font-semibold border border-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        >
          <LogOut className="w-5 h-5"/>
          Terminate Session
        </button>
      </div>

    </div>
  );
}