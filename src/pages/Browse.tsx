import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

import { motion, AnimatePresence } from "framer-motion";

const Browse = () => {

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // =========================
  // LOAD FIRESTORE ITEMS
  // =========================
  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const snap = await getDocs(collection(db, "items"));

      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("🔥 FIRESTORE ITEMS:", list);

      setItems(list);

    } catch (err) {
      console.log("Load error:", err);
    }

    setLoading(false);
  }

  // =========================
  // FILTER ITEMS
  // =========================
  const filteredItems = items.filter(item => {

    const search = searchQuery.toLowerCase();

    const title = item.title?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";
    const status = item.status?.toLowerCase() || "";

    const matchesSearch =
      title.includes(search) ||
      description.includes(search);

    let matchesStatus = true;

    if (selectedStatus === "lost") {
      matchesStatus = status === "lost";
    }

    if (selectedStatus === "found") {
      matchesStatus = status === "found";
    }

    return matchesSearch && matchesStatus;
  });

  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        Loading items...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">

          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold">
              BROWSE <span className="text-primary">ITEMS</span>
            </h1>
          </div>

          {/* SEARCH + FILTER */}
          <div className="glass rounded-2xl p-4 mb-8">
            <div className="flex gap-4 flex-col md:flex-row">

              {/* SEARCH */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 input-dark"
                />
              </div>

              {/* STATUS FILTER */}
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="input-dark md:w-40"
              >
                <option value="all">All Items</option>
                <option value="lost">Lost Only</option>
                <option value="found">Found Only</option>
              </select>

            </div>
          </div>

          {/* COUNT */}
          <p className="mb-6 text-muted-foreground">
            Showing <span className="text-primary">{filteredItems.length}</span> items
          </p>

          {/* ========================= */}
          {/* ⭐ ANIMATED ITEMS GRID */}
          {/* ========================= */}

          {filteredItems.length > 0 ? (
            <motion.div
              layout
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -40 }}
                    transition={{ duration: 0.35 }}
                  >
                    <ItemCard item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20">
              No items found
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;
