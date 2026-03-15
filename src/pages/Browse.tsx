import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Search, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function Browse() {

  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [userInitials, setUserInitials] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
    loadUser();
  }, []);

  async function loadItems() {

    const snap = await getDocs(collection(db, "items"));

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setItems(data);
  }

  async function loadUser() {

    const user = auth.currentUser;

    if (!user) return;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {

      const name = userDoc.data().name || "";

      const initials = name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      setUserInitials(initials);

    }

  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  const filtered = items.filter((item:any) => {

    const matchSearch =
      item.title?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" || item.status === filter;

    return matchSearch && matchFilter;
  });

  return (

    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-[#03122a] text-white relative">

      {/* HEADER */}

      <header className="flex items-center justify-between px-10 py-4 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-lg sticky top-0 z-50">

        {/* LOGO */}

        <Link to="/" className="text-2xl font-bold text-emerald-400">
          FIND<span className="text-white">IT</span>
        </Link>

        {/* NAVIGATION */}

        <nav className="flex items-center gap-6">

          <Link to="/" className="hover:text-emerald-400">
            Home
          </Link>

          <Link to="/browse" className="text-emerald-400 font-semibold">
            Browse
          </Link>

          <Link to="/report-lost" className="hover:text-emerald-400">
            Report Lost
          </Link>

          <Link to="/report-found" className="hover:text-emerald-400">
            Report Found
          </Link>

        </nav>

        {/* USER AREA */}

        <div className="flex items-center gap-4">

          {userInitials && (
  <div className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
    {userInitials}
  </div>
)}

          <button
            onClick={handleLogout}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-black font-semibold"
          >
            Logout
          </button>

          <Bell className="text-gray-300"/>

        </div>

      </header>


      {/* AI GRID BACKGROUND */}

      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#1f2937_1px,transparent_0)] bg-[size:40px_40px]"></div>

      <div className="relative px-10 py-12">

        {/* PAGE TITLE */}

        <h1 className="text-5xl font-bold text-center mb-12 tracking-wide">
          Browse <span className="text-emerald-400">Items</span>
        </h1>


        {/* SEARCH + FILTER */}

        <div className="flex gap-4 mb-10 max-w-6xl mx-auto">

          <div className="flex items-center gap-3 bg-slate-900 px-4 py-3 rounded-xl flex-1 border border-slate-800">

            <Search size={18} className="text-gray-400"/>

            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-200"
            />

          </div>

          <select
            value={filter}
            onChange={(e)=>setFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl"
          >

            <option value="all">All Items</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>

          </select>

        </div>


        {/* ITEM GRID */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

          {filtered.map((item:any)=>(

            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition hover:scale-[1.02]"
            >

              <div className="h-52 overflow-hidden relative">

                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <span
                  className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full uppercase tracking-wide
                  ${
                    item.status === "lost"
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                >
                  {item.status}
                </span>

              </div>

              <div className="p-5">

                <h3 className="text-lg font-semibold mb-1">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {item.location}
                </p>

              </div>

            </Link>

          ))}

        </div>


        {/* EMPTY STATE */}

        {filtered.length === 0 && (

          <div className="text-center mt-16 text-gray-400">
            No items found
          </div>

        )}

      </div>

    </div>

  );
}