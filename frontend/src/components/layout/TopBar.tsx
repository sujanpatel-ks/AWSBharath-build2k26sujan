import { LogOut, Sprout, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-24 flex-col items-center justify-between border-r border-[#bfc9c3]/40 bg-[#f8f9fa]/95 py-6 shadow-[2px_0_12px_rgba(0,0,0,0.03)] backdrop-blur md:flex">
        <button onClick={() => navigate("/dashboard")} className="group flex flex-col items-center gap-1" aria-label="Go to dashboard">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#137333]/20 bg-white text-[#003527] shadow-md shadow-[#003527]/10 transition-transform group-hover:scale-105">
            <Sprout className="h-7 w-7" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#191c1d]">AgroCare</span>
        </button>
        <div className="flex flex-col items-center gap-3">
          <RailLink to="/dashboard" label="Home" icon={<Sprout className="h-5 w-5" />} />
          <RailLink to="/history" label="History" icon={<span className="text-sm">↗</span>} />
          <RailLink to="/diagnosis" label="Scan" icon={<span className="text-sm">✦</span>} featured />
          <RailLink to="/assistant" label="Advisory" icon={<span className="text-sm">?</span>} />
        </div>
        <button onClick={handleSignOut} className="rounded-2xl p-3 text-[#404944] transition hover:bg-[#edeeef] hover:text-[#003527]" aria-label="Sign out">
          <LogOut className="h-5 w-5" />
        </button>
      </aside>
      <header className="sticky top-0 z-30 border-b border-[#bfc9c3]/40 bg-[#f8f9fa]/90 shadow-[0_4px_20px_rgba(0,53,39,0.04)] backdrop-blur md:pl-24">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        {/* Brand */}
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2" aria-label="Go to dashboard">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#003527] text-white shadow-lg shadow-[#003527]/20">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="block font-display text-sm font-black tracking-tight text-[#191c1d]">AgroCare AI</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-[#2b6954]">Cultivating intelligence</span>
          </div>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-2xl p-2 text-[#404944] transition-colors hover:bg-[#edeeef]"
            aria-label="Profile"
            title={user?.username || "Profile"}
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="rounded-2xl p-2 text-[#404944] transition-colors hover:bg-[#edeeef]"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
    </>
  );
}

function RailLink({
  to,
  label,
  icon,
  featured = false,
}: { to: string; label: string; icon: React.ReactNode; featured?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition ${
          featured
            ? "bg-[#003527] text-white shadow-lg shadow-[#003527]/25"
            : isActive
              ? "border border-[#003527]/20 bg-[#003527]/10 text-[#003527]"
              : "text-[#404944] hover:bg-[#edeeef] hover:text-[#003527]"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
