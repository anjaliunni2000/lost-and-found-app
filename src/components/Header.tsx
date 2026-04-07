import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Zap, Shield, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot, orderBy, writeBatch } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const auth = getAuth();
  const db = getFirestore();

  // Handle Scroll state for Glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load Notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user, db]);

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach((n) => {
        batch.update(doc(db, "notifications", n.id), { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

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
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
        ? "bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 shadow-lg" 
        : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] group-hover:scale-105 transition-all duration-300">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>

            <span className="font-display font-bold text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              FINDIT
            </span>
          </Link>

          <div className="flex items-center gap-8">
            {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-900/50 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-white/5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? "text-emerald-400 bg-emerald-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <Link
                to="/chats"
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  location.pathname.startsWith("/chat") || location.pathname === "/chats"
                    ? "text-emerald-400 bg-emerald-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Chats
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="ml-2 px-4 py-2 rounded-xl text-sm font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 flex items-center gap-2 transition"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* AUTH SECTION */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition px-4 py-2">
                  Login
                </Link>

                <Link to="/register" className="text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all">
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4 relative">
                
                {/* Notification Bell */}
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markAllAsRead();
                  }}
                  className="p-2.5 relative rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                    <div className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute top-14 right-16 w-[340px] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] overflow-hidden z-50 backdrop-blur-xl"
                  >
                    <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                      <span className="font-bold text-white tracking-wide">Notifications</span>
                      {notifications.some(n => !n.read) && (
                         <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-lg">
                           {notifications.filter(n=>!n.read).length} New
                         </span>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-[#030712]/50">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                          <Bell className="w-8 h-8 opacity-20 mb-3" />
                          You're all caught up.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              setShowNotifications(false);
                              if (n.link) navigate(n.link);
                            }}
                            className={`p-4 border-b border-slate-800/30 hover:bg-slate-800/50 cursor-pointer transition-colors ${!n.read ? 'bg-emerald-500/5' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                               <p className={`text-sm font-semibold ${!n.read ? 'text-emerald-400' : 'text-slate-300'}`}>{n.title}</p>
                               {n.createdAt && (
                                 <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                                   {formatDistanceToNow(n.createdAt?.toDate(), { addSuffix: true })}
                                 </span>
                               )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                   <img
                     src={
                       user.photoURL ||
                       `https://ui-avatars.com/api/?name=${user.email}&background=020617&color=34d399`
                     }
                     alt="profile"
                     className="w-10 h-10 rounded-full border border-emerald-500/30 p-0.5 object-cover"
                   />
                   <button 
                     onClick={handleLogout} 
                     className="text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 rounded-xl hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                   >
                     Logout
                   </button>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-slate-900 border-x border-b border-slate-800 rounded-b-3xl shadow-2xl mt-2"
          >
            <div className="py-4 space-y-1 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl font-semibold transition ${
                        isActive(link.path) ? "bg-emerald-500/10 text-emerald-400" : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
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
                    className="w-full text-left px-4 py-3 rounded-xl font-semibold text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition"
                  >
                    <Bell className="w-5 h-5" />
                    Chats
                  </button>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-4 py-3 rounded-xl font-bold text-amber-400 hover:bg-amber-400/10 transition mt-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5" />
                    Admin Dashboard
                  </Link>
                )}

                {!user ? (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
                    <Link to="/login" className="flex justify-center py-3 rounded-xl font-semibold bg-white/5 text-white hover:bg-white/10 transition">Login</Link>
                    <Link to="/register" className="flex justify-center py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-lg">Register</Link>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 mb-4">
                      <img
                        src={
                          user.photoURL ||
                          `https://ui-avatars.com/api/?name=${user.email}&background=020617&color=34d399`
                        }
                        alt="profile"
                        className="w-10 h-10 rounded-full border border-emerald-500/30 p-0.5 object-cover"
                      />
                      <span className="text-sm font-medium text-slate-300 truncate">{user.email}</span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex justify-center py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-lg hover:shadow-xl transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
            </div>
          </motion.nav>
        )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;