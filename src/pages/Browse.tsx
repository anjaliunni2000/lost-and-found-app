import { useState, useEffect } from "react";
import { Search, Filter, X, Grid3X3 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const Browse = () => {

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
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

    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      item.category === selectedCategory;

    const matchesLocation =
      selectedLocation === "All" ||
      item.location === selectedLocation;

    const matchesStatus =
      selectedStatus === "all" ||
      item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;

  });

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

          {/* SEARCH */}
          <div className="glass rounded-2xl p-4 mb-8">

            <div className="flex gap-4">

              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3 text-gray-400"/>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 input-dark"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="input-dark"
              >
                <option value="all">All</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>

            </div>

          </div>

          {/* COUNT */}
          <p className="mb-6 text-muted-foreground">
            Showing <span className="text-primary">{filteredItems.length}</span> items
          </p>

          {/* ITEMS GRID */}
          {filteredItems.length > 0 ? (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}

            </div>

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
