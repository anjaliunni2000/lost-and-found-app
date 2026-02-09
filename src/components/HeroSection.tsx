import { Link } from "react-router-dom";
import { Search, Upload, Cpu, Sparkles, ArrowRight, Scan } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 grid-pattern" />
      
      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-pink/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground/80">
              Powered by AI Image Recognition
            </span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="text-foreground">LOST </span>
            <span className="gradient-text text-glow-cyan">SOMETHING</span>
            <span className="text-foreground">?</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Upload a photo. Our neural network scans thousands of items instantly. 
            Get matched in seconds, not days.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/report-lost" className="btn-neon flex items-center gap-2 group">
              <Search className="w-5 h-5" />
              Report Lost Item
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/report-found" className="btn-outline-neon flex items-center gap-2 group">
              <Upload className="w-5 h-5" />
              Report Found Item
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "10K+", label: "Items Matched" },
              { value: "< 2s", label: "Scan Time" },
              { value: "98%", label: "Accuracy" },
              { value: "24/7", label: "AI Active" },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-primary text-glow-cyan mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Scanner Animation */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <Scan className="w-6 h-6 text-primary animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
