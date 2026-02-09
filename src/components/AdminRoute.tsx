import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";


import { doc, getDoc } from "firebase/firestore";

export default function AdminRoute({ children }: any) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().role === "admin") {
        setIsAdmin(true);
      }
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <Navigate to="/" />;

  return children;
}
