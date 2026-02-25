import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216"
          alt="Lost and Found"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70"></div>

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

          {/* 🔥 Explore Button Redirect */}
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-black px-6 py-3 rounded-xl font-semibold w-fit hover:opacity-90 transition"
          >
            Explore Platform
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background px-6">

        <form
          onSubmit={handleLogin}
          autoComplete="off"
          className="w-full max-w-md p-8 rounded-2xl border border-primary/20 bg-black/40 backdrop-blur-xl shadow-2xl"
        >

          <h1 className="text-3xl font-bold text-center mb-6 text-white">
            Hello Again 👋
          </h1>

          {/* EMAIL */}
          <input
            type="email"
            name="login-email"
            autoComplete="username"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded-xl input-dark"
          />

          {/* PASSWORD */}
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
              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neon py-3 text-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* REGISTER LINK */}
          <p className="text-center text-sm text-gray-400 mt-6">
            New user?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline"
            >
              Create Account
            </Link>
          </p>

        </form>

      </div>
    </div>
  );
}