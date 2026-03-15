import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function Register() {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);

  const [loading,setLoading] = useState(false);
  const [emailSent,setEmailSent] = useState(false);

  const handleRegister = async (e:any) => {

    e.preventDefault();

    setLoading(true);

    try {

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // SEND EMAIL VERIFICATION
      await sendEmailVerification(user);

      // SAVE USER DATA
      await setDoc(doc(db,"users",user.uid),{
        name,
        email,
        uid:user.uid,
        verified:false
      });

      setEmailSent(true);

    } catch(error:any) {

      alert(error.message);

    }

    setLoading(false);

  };


  const resendVerification = async () => {

    if(auth.currentUser){

      await sendEmailVerification(auth.currentUser);

      alert("Verification email sent again");

    }

  };


  /* ---------------------------
     EMAIL VERIFICATION SCREEN
  ---------------------------- */

  if(emailSent){

    return(

      <div className="flex items-center justify-center h-screen bg-[#020c1b]">

        <div className="bg-[#071426] p-10 rounded-2xl border border-teal-400/30 text-center w-[420px]">

          <h2 className="text-white text-2xl font-bold mb-4">
            📧 Verify Your Email
          </h2>

          <p className="text-gray-400 mb-6">
            A verification email has been sent to
            <br />
            <span className="text-teal-400">{email}</span>
          </p>

          <p className="text-gray-500 text-sm mb-8">
            Please check your inbox and click the verification link to activate your account.
          </p>

          <button
            onClick={resendVerification}
            className="w-full bg-teal-400 text-black py-3 rounded-lg font-semibold mb-4 hover:bg-teal-500"
          >
            Resend Verification Email
          </button>

          <button
            onClick={()=>navigate("/login")}
            className="w-full border border-teal-400 text-teal-400 py-3 rounded-lg hover:bg-teal-400 hover:text-black"
          >
            Go to Login
          </button>

        </div>

      </div>

    )

  }


  return (

    <div className="flex h-screen w-full">

      {/* LEFT SIDE BACKGROUND */}
      <div className="w-1/2 h-screen relative">

        <img
          src="/robot-bg.png"
          alt="AI Background"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

        <div className="absolute inset-0 flex flex-col justify-center px-16 text-white">

          <h1 className="text-5xl font-bold mb-4">
            Welcome to
            <br />
            <span className="text-teal-400">Lost & Found</span>
          </h1>

          <p className="text-gray-300 text-lg max-w-md mb-6">
            Reconnect people with what matters most. Report lost items,
            discover found belongings, and help return them to their rightful owners.
          </p>

          <button
            onClick={() => navigate("/")}
            className="bg-teal-400 text-black px-6 py-3 rounded-lg font-semibold w-fit hover:bg-teal-500"
          >
            Explore Platform
          </button>

        </div>

      </div>


      {/* RIGHT REGISTER FORM */}
      <div className="w-1/2 bg-[#020c1b] flex items-center justify-center">

        <div className="bg-[#071426] p-10 rounded-2xl w-[420px] border border-teal-400/30 shadow-xl">

          <h2 className="text-white text-2xl font-bold text-center mb-8">
            Create Account
          </h2>

          <form onSubmit={handleRegister}>

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg bg-gray-200 outline-none"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg bg-[#0f1c2e] text-white outline-none"
              required
            />

            <div className="relative mb-6">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#0f1c2e] text-white outline-none pr-12"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? "🙈" : "👁"}
              </button>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-400 text-black py-3 rounded-lg font-semibold hover:bg-teal-500 transition"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>

          </form>

          <p className="text-gray-400 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-400">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>

  )

}