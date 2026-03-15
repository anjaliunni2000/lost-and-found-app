import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/firebase";

type ItemType = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  date?: string;
  status?: string; // "lost" | "found"
  score?: number;
  matchedItemId?: string;
};

type MatchedPair = {
  lostItem: ItemType;
  foundItem: ItemType;
  score?: number;
};

const AdminMatches = () => {
  const [matchedItems, setMatchedItems] = useState<MatchedPair[]>([]);
  const [notMatchedItems, setNotMatchedItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const snapshot = await getDocs(collection(db, "items"));

        const allItems: ItemType[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ItemType[];

        const lostItems = allItems.filter((item) => item.status === "lost");
        const foundItems = allItems.filter((item) => item.status === "found");

        const matchedPairs: MatchedPair[] = [];
        const usedLostIds = new Set<string>();
        const usedFoundIds = new Set<string>();

        // 1. First use saved matchedItemId
        lostItems.forEach((lost) => {
          if (lost.matchedItemId) {
            const found = foundItems.find((f) => f.id === lost.matchedItemId);

            if (found && !usedLostIds.has(lost.id) && !usedFoundIds.has(found.id)) {
              matchedPairs.push({
                lostItem: lost,
                foundItem: found,
                score: lost.score || found.score || 0,
              });

              usedLostIds.add(lost.id);
              usedFoundIds.add(found.id);
            }
          }
        });

        // 2. Fallback matching by title/category/location if matchedItemId not saved
        lostItems.forEach((lost) => {
          if (usedLostIds.has(lost.id)) return;

          const found = foundItems.find((f) => {
            if (usedFoundIds.has(f.id)) return false;

            const sameTitle =
              lost.title?.trim().toLowerCase() === f.title?.trim().toLowerCase();

            const sameCategory =
              lost.category?.trim().toLowerCase() ===
              f.category?.trim().toLowerCase();

            const sameLocation =
              lost.location?.trim().toLowerCase() ===
              f.location?.trim().toLowerCase();

            return sameTitle || (sameCategory && sameLocation);
          });

          if (found) {
            matchedPairs.push({
              lostItem: lost,
              foundItem: found,
              score: lost.score || found.score || 85,
            });

            usedLostIds.add(lost.id);
            usedFoundIds.add(found.id);
          }
        });

        // 3. Only items not already used go to not matched
        const unmatched = allItems.filter(
          (item) => !usedLostIds.has(item.id) && !usedFoundIds.has(item.id)
        );

        setMatchedItems(matchedPairs);
        setNotMatchedItems(unmatched);
      } catch (error) {
        console.error("Error fetching admin matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <Link
        to="/admin/dashboard"
        className="mb-8 inline-flex items-center gap-2 rounded-xl bg-slate-700 px-5 py-3 font-semibold hover:bg-slate-600"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <h1 className="mb-10 text-5xl font-bold">AI Match Results</h1>

      {loading ? (
        <p className="text-lg text-slate-300">Loading matches...</p>
      ) : (
        <>
          <section className="mb-14">
            <div className="mb-5 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" size={28} />
              <h2 className="text-3xl font-bold text-emerald-400">
                Matched Items
              </h2>
            </div>

            {matchedItems.length === 0 ? (
              <p className="text-lg text-slate-300">No matches found</p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {matchedItems.map((pair, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-emerald-400/20 bg-[#0b1530] p-6 shadow-lg"
                  >
                    <div className="mb-4">
                      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                        Match Pair
                      </p>
                      <p className="mt-2 text-lg text-slate-300">
                        Score: {pair.score ?? "N/A"}%
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="rounded-xl bg-[#111c3a] p-4">
                        <h3 className="mb-3 text-2xl font-semibold text-rose-400">
                          Lost Item
                        </h3>
                        <p><span className="font-semibold">Title:</span> {pair.lostItem.title}</p>
                        <p><span className="font-semibold">Description:</span> {pair.lostItem.description}</p>
                        <p><span className="font-semibold">Category:</span> {pair.lostItem.category}</p>
                        <p><span className="font-semibold">Location:</span> {pair.lostItem.location}</p>
                        <p><span className="font-semibold">Date:</span> {pair.lostItem.date}</p>
                      </div>

                      <div className="rounded-xl bg-[#111c3a] p-4">
                        <h3 className="mb-3 text-2xl font-semibold text-emerald-400">
                          Found Item
                        </h3>
                        <p><span className="font-semibold">Title:</span> {pair.foundItem.title}</p>
                        <p><span className="font-semibold">Description:</span> {pair.foundItem.description}</p>
                        <p><span className="font-semibold">Category:</span> {pair.foundItem.category}</p>
                        <p><span className="font-semibold">Location:</span> {pair.foundItem.location}</p>
                        <p><span className="font-semibold">Date:</span> {pair.foundItem.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-center gap-3">
              <XCircle className="text-rose-400" size={28} />
              <h2 className="text-3xl font-bold text-rose-400">
                Not Matched Items
              </h2>
            </div>

            {notMatchedItems.length === 0 ? (
              <p className="text-lg text-slate-300">All items matched</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {notMatchedItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-rose-400/20 bg-[#0b1530] p-6 shadow-lg"
                  >
                    <h3 className="mb-4 text-2xl font-semibold text-white">
                      {item.title || "Untitled Item"}
                    </h3>

                    <div className="space-y-2 text-slate-300">
                      <p>
                        <span className="font-semibold text-white">Description:</span>{" "}
                        {item.description || "No description"}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Category:</span>{" "}
                        {item.category || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Location:</span>{" "}
                        {item.location || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Date:</span>{" "}
                        {item.date || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Status:</span>{" "}
                        {item.status || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminMatches;