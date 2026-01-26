import { Link } from "react-router-dom";
import { ArrowRight, Grid3X3 } from "lucide-react";
import ItemCard from "./ItemCard";
import { notifyMatch } from "@/lib/matchNotifier";
import { mockItems } from "@/data/mockItems";

const RecentItems = () => {
  const recentItems = mockItems.slice(0, 6);

  const handleMockMatch = () => notifyMatch("Black Wallet");

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3">
              <Grid3X3 className="w-5 h-5" />
              <span className="font-display text-sm tracking-wider">LIVE FEED</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-wide">
              RECENT REPORTS
            </h2>
          </div>
          <Link 
            to="/browse" 
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all group"
          >
            View All Items
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentItems;
