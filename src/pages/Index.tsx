import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIMatchHome from "@/components/AIMatchHome";
import { useAuth } from "@/context/AuthContext";
import AdminChatBox from "@/components/AdminChatBox";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse text-lg tracking-wide">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />

      <Header />

      <main className="relative flex flex-col items-center px-6 py-24 max-w-6xl mx-auto">

        {/* ===== HERO SECTION ===== */}
        <div className="text-center max-w-3xl">

          <p className="text-sm tracking-widest text-emerald-400/70 mb-4 uppercase">
            Welcome back,
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold mb-6">
            {displayName} 👋
          </h1>

          {/* Premium Gradient Headline */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Upload Your Lost Item Image
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Our AI system analyzes your image and instantly compares it
            with reported items to find potential matches with high accuracy.
          </p>
        </div>

        {/* ===== AI UPLOAD SECTION ===== */}
        <div className="mt-16 w-full flex justify-center">
          <div className="w-full max-w-3xl p-8 rounded-2xl border border-emerald-400/20 bg-slate-900/60 backdrop-blur-md shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.25)] transition-all duration-500">
            <AIMatchHome />
          </div>
        </div>

      </main>

      <AdminChatBox />
      <Footer />
    </div>
  );
}