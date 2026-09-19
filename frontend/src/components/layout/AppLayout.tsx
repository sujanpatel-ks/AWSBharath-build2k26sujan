import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
