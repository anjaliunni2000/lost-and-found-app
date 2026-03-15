import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminUsers() {

  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {

    setLoading(true);

    const snap = await getDocs(collection(db, "users"));

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setUsers(data);

    setLoading(false);
  }

  async function deleteUser(id: string) {

    if (!confirm("Delete this user?")) return;

    await deleteDoc(doc(db, "users", id));

    loadUsers();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020617] text-white">
        Loading Users...
      </div>
    );
  }

  return (

    <div className="flex bg-[#020617] min-h-screen text-white">

      <AdminSidebar />

      <div className="flex-1 p-10">

        <button
          onClick={() => navigate("/admin")}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded mb-6"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-8">
          Users
        </h1>

        <div className="bg-black/40 rounded-lg p-6">

          {users.map(user => (

            <div
              key={user.id}
              className="flex justify-between border-b border-slate-800 py-3"
            >

              <div>
                {user.email} — {user.role || "user"}
              </div>

              <button
                onClick={() => deleteUser(user.id)}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Delete
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
}