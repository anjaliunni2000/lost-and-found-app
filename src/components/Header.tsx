import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Zap, Shield, Bell } from "lucide-react";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists() && snap.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Admin check error:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-cyan">
              <Zap className="w-5 h-5 text-background" />
            </div>

            <span className="font-display font-bold text-xl tracking-wider">
              <span className="text-primary text-glow-cyan">FIND</span>
              <span className="text-foreground">IT</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
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

            {user && (
              <Link
                to="/chats"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  location.pathname.startsWith("/chat") ||
                  location.pathname === "/chats"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                Chats
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {!user ? (
              <div className="flex gap-4 ml-4">
                <Link to="/login" className="text-sm font-medium">
                  Login
                </Link>

                <Link to="/register" className="text-sm font-medium">
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <button
                  onClick={() => navigate("/chats")}
                  className="p-2 rounded-full hover:bg-secondary transition"
                  title="Open chats"
                >
                  <Bell className="w-6 h-6 text-foreground" />
                </button>

                <img
                  src={
                    user.photoURL ||
                    `https://ui-avatars.com/api/?name=${user.email}`
                  }
                  alt="profile"
                  className="w-9 h-9 rounded-full border border-primary"
                />

                <button onClick={handleLogout} className="btn-neon text-sm">
                  Logout
                </button>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-4 py-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <button
                onClick={() => {
                  navigate("/chats");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 font-medium flex items-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Chats
              </button>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="block px-4 py-3 text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            {!user ? (
              <div className="flex gap-4 px-4 mt-3">
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
                    alt="profile"
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
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;