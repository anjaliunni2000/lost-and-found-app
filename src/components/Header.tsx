import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Zap, Shield, MessageCircle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";

import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const Header = () => {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const auth = getAuth();
  const db = getFirestore();

  // ⭐ Detect Login + Admin Role
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {

      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(docRef);

          if (snap.exists() && snap.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }

        } catch (error) {
          console.error("Admin check error:", error);
        }
      } else {
        setIsAdmin(false);
      }

    });

    return () => unsub();

  }, []);

  // ⭐ Logout
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Browse", path: "/browse" },
    { name: "Report Lost", path: "/report-lost" },
    { name: "Report Found", path: "/report-found" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">

      <div className="container mx-auto px-4">

        <div className="flex items-center justify-between h-16">

          {/* ⭐ LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-cyan">
              <Zap className="w-5 h-5 text-background" />
            </div>

            <span className="font-display font-bold text-xl tracking-wider">
              <span className="text-primary text-glow-cyan">FIND</span>
              <span className="text-foreground">IT</span>
            </span>
          </Link>

          {/* ⭐ DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">

            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}

            

            {/* ⭐ ADMIN */}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* ⭐ AUTH */}
            {!user ? (
              <div className="flex gap-3 ml-4">
                <Link to="/login" className="text-sm font-medium">
                  Login
                </Link>

                <Link to="/register" className="text-sm font-medium">
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">

                {/* Avatar */}
                <img
                  src={
                    user.photoURL ||
                    `https://ui-avatars.com/api/?name=${user.email}`
                  }
                  className="w-9 h-9 rounded-full border border-primary"
                />

                <button
                  onClick={handleLogout}
                  className="btn-neon text-sm"
                >
                  Logout
                </button>

              </div>
            )}

            {/* ⭐ NOTIFICATION + MATCH BUTTON GROUP */}
            {user && (
              <div className="flex items-center gap-3 ml-3">

                <NotificationBell />

                {/* ⭐ MATCH BUTTON */}
                <button
                  onClick={() => navigate("/match-result")}
                  className="
                    flex items-center gap-2
                    px-4 py-2
                    rounded-xl
                    bg-gradient-to-r from-cyan-400 to-teal-500
                    text-white text-sm font-semibold
                    shadow-lg shadow-cyan-500/20
                    hover:scale-105
                    transition-all
                  "
                >
                  <Sparkles size={16} />
                  Match
                </button>

              </div>
            )}

          </nav>

          {/* ⭐ MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>

        </div>

        {/* ⭐ MOBILE MENU */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">

            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className="block px-4 py-3">
                {link.name}
              </Link>
            ))}

            {user && (
              <Link to="/chats" className="block px-4 py-3 font-medium">
                Chats
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="block px-4 py-3 text-primary font-medium">
                Admin Dashboard
              </Link>
            )}

            {!user ? (
              <div className="flex gap-3 px-4 mt-3">
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </div>
            ) : (
              <div className="px-4 mt-4 space-y-3">

                <div className="flex items-center gap-3">
                  <img
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${user.email}`
                    }
                    className="w-9 h-9 rounded-full border border-primary"
                  />
                  <span className="text-sm">{user.email}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full btn-neon text-sm"
                >
                  Logout
                </button>

              </div>
            )}

            <div className="px-4 mt-4 flex items-center gap-3">
              <NotificationBell />

              {user && (
                <button
                  onClick={() => navigate("/match-result")}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm"
                >
                  Match
                </button>
              )}
            </div>

          </nav>
        )}

      </div>
    </header>
  );
};

export default Header;
