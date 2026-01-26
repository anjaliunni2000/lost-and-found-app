import Header from "@/components/Header";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 grid-pattern opacity-40"></div>
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl"></div>

      {/* CONTENT */}
      <div className="relative z-10">
        <Header />

        {/* HERO SECTION */}
        <section className="px-8 py-20 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to <span className="gradient-text">Lost & Found</span>
          </h1>

          <p className="text-muted-foreground max-w-2xl mb-10 text-lg">
            A smart platform to report, track, and recover lost items easily
            using modern technology.
          </p>

          <div className="flex gap-4">
            <Link
              to="/browse"
              className="btn-neon"
            >
              Browse Items
            </Link>

            <Link
              to="/report-lost"
              className="btn-outline-neon"
            >
              Report Lost Item
            </Link>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-8 pb-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-dark p-6">
            <h3 className="text-xl font-semibold mb-2">
              Report Lost Items
            </h3>
            <p className="text-muted-foreground text-sm">
              Quickly submit details of items you have lost with images and
              descriptions.
            </p>
          </div>

          <div className="card-dark p-6">
            <h3 className="text-xl font-semibold mb-2">
              Report Found Items
            </h3>
            <p className="text-muted-foreground text-sm">
              Help others by reporting items you have found in your area.
            </p>
          </div>

          <div className="card-dark p-6">
            <h3 className="text-xl font-semibold mb-2">
              Smart Matching
            </h3>
            <p className="text-muted-foreground text-sm">
              The system helps match lost and found items efficiently.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
