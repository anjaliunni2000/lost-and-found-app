import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);

  const [lostItems, setLostItems] = useState(0);
  const [foundItems, setFoundItems] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {

      // ================= USERS =================
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setUsers(usersData);

      // ⭐ USER EMAIL MAP
      const userMap: any = {};
      usersData.forEach((u: any) => {
        userMap[u.id] = u.email;
      });

      // ================= ITEMS =================
      const itemsSnap = await getDocs(collection(db, "items"));
      const itemsData = itemsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setItems(itemsData);

      setLostItems(itemsData.filter((i: any) => i.status === "lost").length);
      setFoundItems(itemsData.filter((i: any) => i.status === "found").length);

      // ================= FEEDBACK =================
      const feedbackSnap = await getDocs(collection(db, "feedback"));

      const feedbackData = feedbackSnap.docs.map(d => {

        const fb: any = { id: d.id, ...d.data() };

        return {
          ...fb,

          // ⭐ PRIORITY ORDER
          userEmail:
            fb.userEmail ||            // if saved directly in feedback
            userMap[fb.userId] ||      // else lookup from users collection
            fb.userId ||               // else show UID
            "Unknown User"             // final fallback
        };
      });

      setFeedback(feedbackData);

    } catch (err) {
      console.log("ADMIN LOAD ERROR:", err);
    }

    setLoading(false);
  }

  // ================= DELETE FUNCTIONS =================
  async function deleteUser(id: string) {
    await deleteDoc(doc(db, "users", id));
    loadData();
  }

  async function deleteItem(id: string) {
    await deleteDoc(doc(db, "items", id));
    loadData();
  }

  async function deleteFeedback(id: string) {
    await deleteDoc(doc(db, "feedback", id));
    loadData();
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="p-10 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <div className="flex gap-3">
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
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <Stat title="Total Items" value={items.length} color="bg-blue-500"/>
        <Stat title="Total Users" value={users.length} color="bg-green-500"/>
        <Stat title="Lost Items" value={lostItems} color="bg-red-500"/>
        <Stat title="Found Items" value={foundItems} color="bg-purple-500"/>
      </div>

      {/* USERS */}
      <h2 className="text-xl mb-3">Users</h2>
      <div className="bg-black/40 p-4 rounded mb-10">
        {users.map(user => (
          <div key={user.id} className="flex justify-between border-b py-2">
            <div>
              {user.email} — {user.role || "user"}
            </div>

            <button
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              onClick={() => deleteUser(user.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ITEMS */}
      <h2 className="text-xl mb-3">Items</h2>
      <div className="bg-black/40 p-4 rounded mb-10">
        {items.map(item => (
          <div key={item.id} className="flex justify-between border-b py-2">
            <div>
              {item.title} — {item.status}
            </div>

            <button
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              onClick={() => deleteItem(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* FEEDBACK */}
      <h2 className="text-xl mb-3">User Feedback</h2>

      <div className="bg-black/40 p-4 rounded">

        {feedback.length === 0 && (
          <p className="text-gray-400">
            No feedback submitted yet
          </p>
        )}

        {feedback.map(fb => (
          <div
            key={fb.id}
            className="border-b py-4 flex justify-between items-start"
          >

            <div>
              <p className="text-primary font-semibold">
                {fb.userEmail}
              </p>

              <p className="text-yellow-400 font-semibold">
                {fb.rating} ⭐
              </p>

              <p className="text-gray-200 mt-1">
                {fb.comment}
              </p>
            </div>

            <button
              onClick={() => deleteFeedback(fb.id)}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

function Stat({ title, value, color }: any) {
  return (
    <div className={`${color} p-6 rounded-xl`}>
      <div className="text-lg">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
