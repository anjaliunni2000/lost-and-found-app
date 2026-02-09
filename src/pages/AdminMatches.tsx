import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminMatch() {

  const [matchedItems, setMatchedItems] = useState<any[]>([]);
  const [notMatchedItems, setNotMatchedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {

      // ========================
      // ⭐ GET MATCHES
      // ========================
      const matchesSnap = await getDocs(collection(db, "matches"));
      const matchesData = matchesSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // ========================
      // ⭐ GET ITEMS
      // ========================
      const itemsSnap = await getDocs(collection(db, "items"));
      const itemsData = itemsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // ========================
      // ✅ MATCH FOUND
      // ========================
      const matched = matchesData.filter(
        (m: any) => m.status === "found"
      );

      // ========================
      // ✅ NOT MATCHED
      // ONLY LOST ITEMS
      // ========================
      const notMatched = itemsData.filter(
        (item: any) => item.status === "lost"
      );

      setMatchedItems(matched);
      setNotMatchedItems(notMatched);

    } catch (err) {
      console.log("LOAD ERROR:", err);
    }

    setLoading(false);
  }

  if (loading)
    return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="p-10 text-white">

      <h1 className="text-3xl font-bold mb-8">
        AI Match Results
      </h1>

      {/* ================= MATCH FOUND ================= */}
      <h2 className="text-green-400 text-xl mb-4">
        ✅ Match Found Items
      </h2>

      {matchedItems.length === 0 ? (
        <div className="bg-green-900 p-4 rounded mb-8">
          No matched items yet
        </div>
      ) : (
        matchedItems.map(item => (
          <div key={item.id} className="bg-green-900 p-4 rounded mb-3">
            <div className="font-bold">
              {item.itemName}
            </div>
            <div>
              Confidence: {item.confidence || 0}%
            </div>
            <div>Status: Found</div>
          </div>
        ))
      )}

      {/* ================= NOT MATCHED ================= */}
      <h2 className="text-red-400 text-xl mt-10 mb-4">
        ❌ Not Matched Items
      </h2>

      {notMatchedItems.length === 0 ? (
        <div className="bg-red-900 p-4 rounded">
          All items matched 🎉
        </div>
      ) : (
        notMatchedItems.map(item => (
          <div key={item.id} className="bg-red-900 p-4 rounded mb-3">
            <div className="font-bold">
              {item.title}
            </div>
            <div>Status: {item.status}</div>
            <div>Location: {item.location}</div>
          </div>
        ))
      )}

    </div>
  );
}
