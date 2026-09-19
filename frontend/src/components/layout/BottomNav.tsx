import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Scan, MessageSquare, Clock } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/dashboard",  label: "Home",     Icon: LayoutDashboard },
  { to: "/diagnosis",  label: "Scan",     Icon: Scan },
  { to: "/assistant",  label: "Advisory", Icon: MessageSquare },
  { to: "/history",    label: "History",  Icon: Clock },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 safe-area-bottom"
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors min-h-[56px]",
                isActive
                  ? "text-agro-600"
                  : "text-gray-400 hover:text-gray-600"
              )
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={clsx(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110"
                  )}
                  aria-hidden="true"
                />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-agro-600 rounded-t-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
