import { Camera, Cpu, Bell, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "01. CAPTURE",
    description: "Upload a photo of your lost or found item through our interface.",
    color: "from-primary to-primary/50",
  },
  {
    icon: Cpu,
    title: "02. ANALYZE",
    description: "Our neural network extracts unique visual features and creates a digital fingerprint.",
    color: "from-accent to-accent/50",
  },
  {
    icon: Bell,
    title: "03. MATCH",
    description: "AI compares against database in real-time. Get notified instantly when matched.",
    color: "from-warning to-warning/50",
  },
  {
    icon: CheckCircle2,
    title: "04. REUNITE",
    description: "Connect securely through our platform and retrieve your belongings.",
    color: "from-success to-success/50",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-wider">
            HOW IT <span className="gradient-text">WORKS</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Advanced computer vision meets seamless user experience. 
            Finding lost items has never been this efficient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="group relative">
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full">
                  <ArrowRight className="w-6 h-6 text-border" />
                </div>
              )}
              
              <div className="card-dark p-8 h-full relative overflow-hidden">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-7 h-7 text-background" />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-sm tracking-wider text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Corner Decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`absolute top-4 right-4 w-1 h-8 bg-gradient-to-b ${step.color}`} />
                  <div className={`absolute top-4 right-4 w-8 h-1 bg-gradient-to-r ${step.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
