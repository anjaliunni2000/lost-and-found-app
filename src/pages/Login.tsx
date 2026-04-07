import { useState } from "react";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Logged in UID:", user.uid);
      console.log("Logged in email:", user.email);

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        alert("Please verify your email before logging in. A verification email has been sent again.");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.log("User document not found");
        alert("User profile not found in database.");
        return;
      }

      const userData = userDocSnap.data();
      const role = userData?.role || "";

      console.log("User role from Firestore:", role);

      if (!userData?.verified) {
        await updateDoc(userDocRef, {
          verified: true,
        });
      }

      if (role === "admin" || user.email === "admin123@yopmail.com") {
        console.log("Navigating to admin dashboard");
        navigate("/admin", { replace: true });
      } else {
        console.log("Navigating to user dashboard");
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Button removed.

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216"
          alt="Lost and Found"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Welcome to <br />
            <span className="text-primary">Lost & Found</span>
          </h1>

          <p className="text-lg text-gray-300 mb-8 max-w-md">
            Reconnect people with what matters most.
            Report lost items, discover found belongings,
            and make someone's day better.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background px-6">
        <form
          onSubmit={handleLogin}
          autoComplete="off"
          className="w-full max-w-md p-8 rounded-2xl border border-primary/20 bg-black/40 backdrop-blur-xl shadow-2xl"
        >
          <h1 className="text-3xl font-bold text-center mb-6 text-white">
            Hello Again 👋
          </h1>

          <input
            type="email"
            name="login-email"
            autoComplete="username"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded-xl input-dark"
          />

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="login-password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl input-dark pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neon py-3 text-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            New user?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}