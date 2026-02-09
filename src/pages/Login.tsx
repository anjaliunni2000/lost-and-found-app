import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {

      setLoading(true);
      setError("");

      // ⭐ LOGIN AUTH
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      console.log("LOGIN SUCCESS:", user.uid);

      // ⭐ CHECK USER EXISTS IN FIRESTORE
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let role = "user";

      // ⭐ IF USER NOT EXISTS → CREATE
      if (!userSnap.exists()) {

        console.log("Creating Firestore user document");

        await setDoc(userRef, {
          email: user.email,
          role: "user",
          createdAt: serverTimestamp()
        });

        role = "user";

      } else {

        role = userSnap.data()?.role || "user";

      }

      console.log("USER ROLE:", role);

      // ⭐ SAVE ROLE LOCALLY
      localStorage.setItem("role", role);

      // ⭐ REDIRECT
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err: any) {

      console.log("LOGIN ERROR:", err);
      setError(err.message || "Login failed");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-sm text-center">
            Don’t have an account?{" "}
            <Link to="/register" className="text-primary">
              Register
            </Link>
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
