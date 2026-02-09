import { Bell } from "lucide-react";
import { useState, useEffect } from "react";

import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function NotificationBell() {

  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="relative p-2"
      >
        <Bell />

        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 p-3 rounded-xl shadow-xl">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="border-b border-slate-700 p-2">
                {n.message}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
