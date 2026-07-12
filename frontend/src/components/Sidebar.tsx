import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
// const { user } = useAuth();


const navItems = [
  { icon: "🏠", label: "Overview", path: "/dashboard" },
  { icon: "📋", label: "My Bookings", path: "/dashboard/bookings" },
  { icon: "🔍", label: "Browse Providers", path: "/providers" },
  { icon: "⭐", label: "My Reviews", path: "/dashboard/reviews" },
  { icon: "💳", label: "Payments", path: "/dashboard/payments" },
  { icon: "👤", label: "Profile", path: "/dashboard/profile" },
  { icon: "⚙️", label: "Settings", path: "/dashboard/settings" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#0a1f5c] min-h-screen flex flex-col transition-all duration-300 sticky top-0 h-screen`}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#1a3a7a]">
        {sidebarOpen && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-xl">🔧</span>
            <span className="font-bold text-white text-lg">ServiceHub</span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white transition cursor-pointer ml-auto"
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer text-left ${
                isActive
                  ? "bg-[#1a6ff0] text-white"
                  : "text-gray-400 hover:bg-[#1a3a7a] hover:text-white"
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#1a3a7a]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
        >
          <span className="text-lg flex-shrink-0">🚪</span>
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;