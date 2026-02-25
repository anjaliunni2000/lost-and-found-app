import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !phone || !email || password.length < 6) {
      setError("Please fill all fields. Password must be 6+ characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name,
        phone,
        email,
        role: "user",
        createdAt: serverTimestamp()
      });

      navigate("/");

    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE - IMAGE SECTION */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf"
          alt="Lost and Found Community"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/70"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Join <br />
            <span className="text-primary">Lost & Found</span>
          </h1>

          <p className="text-lg text-gray-300 max-w-md">
            Create your account and help reconnect lost belongings
            with their rightful owners. Be part of a caring community.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - REGISTER FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-slate-950 text-white px-6">

        <form
          onSubmit={handleRegister}
          autoComplete="off"
          className="bg-slate-900 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-primary/20"
        >

          <h2 className="text-3xl font-bold mb-6 text-center">
            Create Account
          </h2>

          {/* NAME */}
          <input
            name="full-name"
            autoComplete="off"
            placeholder="Full Name"
            className="w-full mb-3 p-3 rounded-xl bg-slate-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* PHONE */}
          <input
            type="tel"
            name="phone-number"
            autoComplete="off"
            placeholder="Phone Number"
            className="w-full mb-3 p-3 rounded-xl bg-slate-800"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* EMAIL */}
          <input
            type="email"
            name="new-email"
            autoComplete="new-email"
            placeholder="Email"
            className="w-full mb-3 p-3 rounded-xl bg-slate-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="new-password"
              autoComplete="new-password"
              placeholder="Password"
              className="w-full p-3 rounded-xl bg-slate-800 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {error && (
            <p className="text-red-400 mb-3 text-sm">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-primary py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <p className="text-sm text-center mt-4">
            Already have account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>

        </form>

      </div>
    </div>
  );
}