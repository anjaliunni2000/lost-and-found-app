import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  LayoutDashboard,
  Users,
  Package,
  Brain,
  CheckCircle,
  MessageSquare,
  LogOut
} from "lucide-react";

export default function AdminSidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition
    ${
      location.pathname === path
        ? "bg-emerald-500 text-black"
        : "text-gray-300 hover:bg-slate-800"
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

    <div className="w-64 bg-[#020617] border-r border-slate-800 min-h-screen p-6 flex flex-col">

      <h1 className="text-2xl font-bold text-emerald-400 mb-10">
        Admin Panel
      </h1>

      <nav className="space-y-2 flex-1">

        <Link to="/admin" className={linkClass("/admin")}>
          <LayoutDashboard size={18}/>
          Dashboard
        </Link>

        <Link to="/admin/users" className={linkClass("/admin/users")}>
          <Users size={18}/>
          Users
        </Link>

        <Link to="/admin/items" className={linkClass("/admin/items")}>
          <Package size={18}/>
          Items
        </Link>

        <Link to="/admin/matches" className={linkClass("/admin/matches")}>
          <Brain size={18}/>
          AI Matches
        </Link>

        <Link to="/admin/match-approval" className={linkClass("/admin/match-approval")}>
          <CheckCircle size={18}/>
          Match Approval
        </Link>

        <Link to="/admin/feedback" className={linkClass("/admin/feedback")}>
          <MessageSquare size={18}/>
          Feedback
        </Link>

      </nav>

      {/* LOGOUT BUTTON */}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 text-red-400 hover:text-red-300 mt-6"
      >
        <LogOut size={18}/>
        Logout
      </button>

    </div>

  );
}