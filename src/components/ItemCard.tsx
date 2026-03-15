
import { MapPin, Calendar, Tag, ArrowUpRight, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export type Item = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  date?: string;
  image?: string;
  imageUrl?: string;
  matchApproved?: boolean;
};

interface ItemCardProps {
  item: Item;
  showChat?: boolean;
}

const ItemCard = ({ item, showChat }: ItemCardProps) => {

  const navigate = useNavigate();

  // Resolve image source (Firestore / Uploaded / Fallback)
  const imageSrc =
  item.imageUrl ||
  item.image ||
  "/placeholder.svg";

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(`/chat/${item.id}`);
  };

  const statusLabel =
    item.status?.charAt(0).toUpperCase() + item.status?.slice(1);

  return (

    <Link to={`/item/${item.id}`} className="block group">

      <article className="card-dark overflow-hidden relative">

        {/* ================= IMAGE ================= */}

        <div className="relative aspect-[4/3] overflow-hidden bg-black">

          <img
            src={imageSrc}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {/* STATUS BADGE */}

          <div className="absolute top-4 left-4">
            <span className={`status-${item.status}`}>
              {statusLabel}
            </span>
          </div>

          {/* HOVER ARROW */}

          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="p-5">

          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {item.description}
          </p>

          {/* META INFO */}

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">

            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span>{item.category}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{item.location}</span>
            </div>

            {item.date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{item.date}</span>
              </div>
            )}

          </div>

          {/* ================= CHAT BUTTON ================= */}

          {(showChat || item.matchApproved) && (

            <button
              onClick={handleChatClick}
              className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg text-sm hover:bg-primary/80 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Finder
            </button>

          )}

        </div>

        {/* BOTTOM GLOW LINE */}

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      </article>

    </Link>

  );

};

export default ItemCard;

