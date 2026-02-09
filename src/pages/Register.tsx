import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 🔥 Create Firestore User Document
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        role: "user", // ⭐ Default role
        createdAt: new Date()
      });

      console.log("User created + Firestore saved");

      navigate("/");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
 _attachIgnore: undefined
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

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

          <Button className="w-full" onClick={handleRegister} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>

          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
