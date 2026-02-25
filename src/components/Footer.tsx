import { Link, NavLink } from "react-router-dom";
import { Zap, Github, Twitter, Mail } from "lucide-react";
import { useState } from "react";
import HelpModal from "@/components/HelpModal";

const Footer = () => {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-border bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-background" />
                </div>
                <span className="font-bold text-xl tracking-wider">
                  <span className="text-primary">FIND</span>
                  <span className="text-foreground">IT</span>
                </span>
              </Link>

              <p className="text-muted-foreground max-w-sm mb-6">
                Next-gen AI-powered lost and found system.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm tracking-wider text-primary mb-4">
                NAVIGATION
              </h4>
              <ul className="space-y-3">
                <li><NavLink to="/browse" className="hover:text-primary">Browse Items</NavLink></li>
                <li><NavLink to="/report-lost" className="hover:text-primary">Report Lost</NavLink></li>
                <li><NavLink to="/report-found" className="hover:text-primary">Report Found</NavLink></li>
                <li><NavLink to="/how-it-works" className="hover:text-primary">How It Works</NavLink></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm tracking-wider text-primary mb-4">
                SUPPORT
              </h4>
              <ul className="space-y-3">

                {/* Help Center Popup */}
                <li>
                  <button
                    onClick={() => setHelpOpen(true)}
                    className="text-muted-foreground hover:text-primary transition"
                  >
                    Help Center
                  </button>
                </li>

                {/* Contact Us → Scroll to Chat */}
                <li>
                  <a
                    href="#admin-chat"
                    className="text-muted-foreground hover:text-primary transition"
                  >
                    Contact Us
                  </a>
                </li>

                <li>
                  <Link to="/privacy" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link to="/terms" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>

              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2026 FindIt
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">System Online</span>
            </div>
          </div>
        </div>
      </footer>

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default Footer;