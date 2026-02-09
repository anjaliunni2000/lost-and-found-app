import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIMatchHome from "@/components/AIMatchHome";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main>
        <AIMatchHome />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
