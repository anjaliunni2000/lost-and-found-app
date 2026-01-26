import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Header = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <Link to="/" className="text-xl font-bold">
        Lost & Found
      </Link>

      <nav className="flex items-center gap-4">
        <Link to="/browse">Browse</Link>
        <Link to="/report-lost">Report Lost</Link>
        <Link to="/report-found">Report Found</Link>

        {user && (
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </nav>
    </header>
  );
};

export default Header;
