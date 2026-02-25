import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-24 space-y-8">
        <h1 className="text-4xl font-bold text-emerald-400">
          Privacy Policy & Terms
        </h1>

        <p className="text-gray-400 leading-relaxed">
          We respect your privacy. All uploaded images and data are securely stored.
          We do not share user data with third parties.
        </p>

        <p className="text-gray-400 leading-relaxed">
          By using FindIt, you agree to provide accurate information
          and use the platform responsibly.
        </p>

        <p className="text-gray-400 leading-relaxed">
          All AI processing is done securely. Your personal information
          remains confidential.
        </p>
      </main>

      <Footer />
    </div>
  );
}