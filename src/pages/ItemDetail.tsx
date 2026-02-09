import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Tag, User, Mail, ArrowLeft, Share2, Flag, Cpu } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockItems } from "@/data/mockItems";
import { toast } from "sonner";

const ItemDetail = () => {
  const { id } = useParams();
  const item = mockItems.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">ITEM NOT FOUND</h1>
            <p className="text-muted-foreground mb-6">
              The item you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/browse" className="btn-neon">
              Back to Browse
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleContact = () => {
    toast.success("Contact request sent!", {
      description: "The owner will be notified of your interest.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Link */}
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden card-dark">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 left-4">
                <span className={`status-${item.status}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-wide">
                {item.title}
              </h1>

              <p className="text-muted-foreground text-lg mb-8">
                {item.description}
              </p>

              {/* Meta Info */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: Tag, label: "Category", value: item.category },
                  { icon: MapPin, label: "Location", value: item.location },
                  { icon: Calendar, label: "Date Reported", value: item.date },
                  { icon: User, label: "Posted by", value: "Anonymous User" },
                ].map((meta, i) => (
                  <div key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <meta.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{meta.label}</div>
                      <div className="font-medium">{meta.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {item.status !== "matched" && (
                  <button
                    onClick={handleContact}
                    className="w-full btn-neon py-4 text-lg"
                  >
                    <Mail className="w-5 h-5 mr-2 inline" />
                    {item.status === "lost" ? "I Found This Item" : "This is My Item"}
                  </button>
                )}

                {item.status === "matched" && (
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-center">
                    <p className="text-accent font-semibold">
                      🎉 This item has been successfully matched!
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 btn-outline-neon py-3"
                  >
                    <Share2 className="w-4 h-4 mr-2 inline" />
                    Share
                  </button>
                  <button className="flex-1 py-3 rounded-xl border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors">
                    <Flag className="w-4 h-4 mr-2 inline" />
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Match Status */}
          {item.status === "lost" && (
            <div className="mt-12 glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Cpu className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground tracking-wide">
                  AI MATCHING STATUS
                </h2>
              </div>
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Scanning database...</div>
                  <div className="text-sm text-muted-foreground">
                    Checking against 127 found items
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ItemDetail;
