import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function useUnreadMessages() {

  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {

    if (!user) return;

    const q = query(
      collection(db, "messages"),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, snapshot => {

      const unread = snapshot.docs.filter(
        d => d.data().senderId !== user.uid
      );

      setCount(unread.length);

    });

    return () => unsub();

  }, [user]);

  return count;
}