import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

export default function AppLayout() {
  return (
    <div className="agro-shell flex min-h-screen flex-col">
      <TopBar />
      <main className="flex-1 overflow-y-auto md:pl-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
