import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Upload, ScanSearch, BellRing, ShieldCheck } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_60%)] pointer-events-none" />

      <Header />

      <main className="relative max-w-6xl mx-auto px-6 py-24">

        {/* ===== PAGE TITLE ===== */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-6">
            How FindIt Works
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            FindIt uses advanced AI-powered image recognition to match lost and found items.
            Our intelligent system helps reunite people with their belongings faster and more securely.
          </p>
        </div>

        {/* ===== STEPS SECTION ===== */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* Step 1 */}
          <div className="p-8 rounded-2xl border border-emerald-400/20 bg-slate-900/60 backdrop-blur-md hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all duration-500">
            <Upload className="w-10 h-10 text-emerald-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">1. Upload or Report</h2>
            <p className="text-gray-400 leading-relaxed">
              Users can report a lost or found item by uploading an image and
              entering item details. The system securely stores the information
              in our database.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl border border-emerald-400/20 bg-slate-900/60 backdrop-blur-md hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all duration-500">
            <ScanSearch className="w-10 h-10 text-cyan-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">2. AI Image Analysis</h2>
            <p className="text-gray-400 leading-relaxed">
              Our AI model analyzes visual features from the uploaded image
              using computer vision and compares it with existing lost or
              found items in the system.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl border border-emerald-400/20 bg-slate-900/60 backdrop-blur-md hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all duration-500">
            <BellRing className="w-10 h-10 text-teal-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">3. Smart Matching</h2>
            <p className="text-gray-400 leading-relaxed">
              The system calculates similarity scores and identifies potential
              matches. If a match is found, users receive instant notifications
              through the dashboard.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-8 rounded-2xl border border-emerald-400/20 bg-slate-900/60 backdrop-blur-md hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all duration-500">
            <ShieldCheck className="w-10 h-10 text-green-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">4. Secure Reconnection</h2>
            <p className="text-gray-400 leading-relaxed">
              Once a match is confirmed, users can securely connect and verify
              ownership. Privacy and security are prioritized throughout the process.
            </p>
          </div>

        </div>

        {/* ===== FINAL CTA ===== */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl font-semibold mb-6">
            Ready to Find Your Lost Item?
          </h3>
          <a
            href="/"
            className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:scale-105 transition-transform duration-300 shadow-lg shadow-emerald-500/20"
          >
            Start AI Matching
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}