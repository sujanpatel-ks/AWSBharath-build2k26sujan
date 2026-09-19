import { NavLink } from "react-router-dom";
import { Clock3, LayoutDashboard, MessageSquare, Scan } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", Icon: LayoutDashboard },
  { to: "/history", label: "History", Icon: Clock3 },
  { to: "/assistant", label: "Advisory", Icon: MessageSquare },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#bfc9c3]/40 bg-[#f8f9fa]/95 pb-safe shadow-[0_-4px_20px_rgba(0,53,39,0.06)] backdrop-blur-xl md:hidden"
      aria-label="Main navigation"
    >
      <div className="relative mx-auto grid max-w-lg grid-cols-4 items-center px-2">
        <NavItem {...NAV_ITEMS[0]} />
        <NavItem {...NAV_ITEMS[1]} />
        <NavLink
          to="/diagnosis"
          className="relative -top-5 mx-auto flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-full border-4 border-[#f8f9fa] bg-[#003527] text-white shadow-[0_8px_24px_rgba(0,53,39,0.35)] transition hover:bg-[#064e3b]"
          aria-label="Scan crop"
        >
          <Scan className="h-7 w-7" strokeWidth={2.4} />
          <span className="text-[9px] font-black uppercase tracking-[0.12em]">Scan</span>
        </NavLink>
        <NavItem {...NAV_ITEMS[2]} />
      </div>
    </nav>
  );
}

function NavItem({ to, label, Icon }: (typeof NAV_ITEMS)[number]) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition",
          isActive ? "text-[#003527]" : "text-[#404944] hover:text-[#003527]"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={clsx("rounded-full p-1.5", isActive && "bg-[#003527]/10")}>
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
