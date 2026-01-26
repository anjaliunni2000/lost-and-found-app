import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Cpu, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA Card */}
          <div className="glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-32 h-32">
              <div className="absolute top-6 left-6 w-1 h-16 bg-gradient-to-b from-primary to-transparent" />
              <div className="absolute top-6 left-6 w-16 h-1 bg-gradient-to-r from-primary to-transparent" />
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32">
              <div className="absolute bottom-6 right-6 w-1 h-16 bg-gradient-to-t from-accent to-transparent" />
              <div className="absolute bottom-6 right-6 w-16 h-1 bg-gradient-to-l from-accent to-transparent" />
            </div>

            <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />
            
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-wide">
              START YOUR <span className="gradient-text">SEARCH</span>
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              Join the network. Every item reported increases the chance of successful matches. 
              It's free, fast, and powered by state-of-the-art AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/report-lost" className="btn-neon flex items-center justify-center gap-2 group">
                Report Lost Item
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/browse" className="btn-outline-neon flex items-center justify-center gap-2">
                Browse Database
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Zap, label: "Instant Matching", desc: "Results in seconds" },
                { icon: Shield, label: "Secure Platform", desc: "Privacy protected" },
                { icon: Cpu, label: "AI Powered", desc: "Neural network tech" },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground text-sm">{feature.label}</div>
                    <div className="text-xs text-muted-foreground">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
