import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { getFCMToken } from "@/firebase/messaging";   // ⭐ NEW IMPORT

type AuthContextType = {
  user: User | null;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // ================= GET USER ROLE =================
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));

          if (snap.exists()) {
            const data = snap.data();
            setRole(data.role ?? "user");
          } else {
            setRole("user");
          }

          // ================= GET FCM TOKEN =================
          try {
            const token = await getFCMToken();

            if (token) {
              await setDoc(
                doc(db, "users", firebaseUser.uid),
                { fcmToken: token },
                { merge: true }
              );
              console.log("✅ FCM token saved");
            }

          } catch (tokenErr) {
            console.log("FCM token error:", tokenErr);
          }

        } catch (err) {
          console.log("Firestore error:", err);
          setRole("user");
        }

      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();

  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
