import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

import AdminSidebar from "@/components/AdminSidebar";

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

      setLostItems(
        itemsData.filter(i => i.status === "lost").length
      );

      setFoundItems(
        itemsData.filter(i => i.status === "found").length
      );

    } catch (err) {

      console.error("ADMIN DASHBOARD ERROR:", err);

    }

    setLoading(false);
  }

  if (loading) {

    return (
      <div className="flex items-center justify-center h-screen bg-[#020617] text-white">
        Loading Admin Dashboard...
      </div>
    );

  }

  return (

    <div className="flex bg-[#020617] min-h-screen text-white">

      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">

          <h1 className="text-4xl font-bold">
            Admin Dashboard
          </h1>

          {/* <div className="flex gap-3">

            <button
              onClick={() => navigate("/admin/matches")}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-semibold"
            >
              View AI Matches
            </button>

            <button
              onClick={() => navigate("/admin/match-approval")}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
            >
              Match Approval
            </button>

          </div> */}

        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6">

          <Stat
            title="Total Items"
            value={itemsCount}
            color="bg-blue-500"
          />

          <Stat
            title="Total Users"
            value={usersCount}
            color="bg-green-500"
          />

          <Stat
            title="Lost Items"
            value={lostItems}
            color="bg-red-500"
          />

          <Stat
            title="Found Items"
            value={foundItems}
            color="bg-purple-500"
          />

        </div>

      </div>

    </div>
  );
}


/* ================= STAT CARD ================= */

function Stat({ title, value, color }: any) {

  return (

    <div className={`${color} p-6 rounded-xl shadow-lg`}>

      <div className="text-lg opacity-90">
        {title}
      </div>

      <div className="text-3xl font-bold mt-1">
        {value}
      </div>

    </div>

  );

}