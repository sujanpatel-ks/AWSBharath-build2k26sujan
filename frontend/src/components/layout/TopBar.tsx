import { Leaf, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import toast from "react-hot-toast";

export default function TopBar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2" aria-label="Go to dashboard">
          <div className="w-7 h-7 rounded-lg bg-agro-600 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">AgroCare AI</span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Profile"
            title={user?.username || "Profile"}
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
