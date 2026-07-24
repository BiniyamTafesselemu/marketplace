import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

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
  const { logout, user } = useAuth();
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
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition cursor-pointer ml-auto">
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* User Info */}
      {sidebarOpen && (
        <div className="px-5 py-4 border-b border-[#1a3a7a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1a6ff0] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.role[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-semibold capitalize">{user?.role}</p>
              <p className="text-gray-400 text-xs">ID #{user?.id}</p>
            </div>
          </div>
          {user?.role === "admin" && (
            <span className="inline-block mt-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">Admin</span>
          )}
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

        {/* Customer Nav */}
        {sidebarOpen && (
          <p className="text-xs text-gray-600 uppercase tracking-wide px-4 py-2 font-semibold">Customer</p>
        )}
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer text-left ${
                isActive ? "bg-[#1a6ff0] text-white" : "text-gray-400 hover:bg-[#1a3a7a] hover:text-white"
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}

        {/* Provider Nav */}
        <div className="pt-2">
          {sidebarOpen && (
            <p className="text-xs text-gray-600 uppercase tracking-wide px-4 py-2 font-semibold">Provider</p>
          )}
          <button
            onClick={() => navigate("/dashboard/provider")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer text-left ${
              location.pathname === "/dashboard/provider" ? "bg-[#1a6ff0] text-white" : "text-gray-400 hover:bg-[#1a3a7a] hover:text-white"
            }`}
          >
            <span className="text-lg flex-shrink-0">🏪</span>
            {sidebarOpen && <span className="text-sm font-medium">Provider Dashboard</span>}
          </button>
        </div>

        {/* Admin Nav */}
        {user?.role === "admin" && (
          <div className="pt-2">
            {sidebarOpen && (
              <p className="text-xs text-gray-600 uppercase tracking-wide px-4 py-2 font-semibold">Admin</p>
            )}
            <button
              onClick={() => navigate("/admin")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer text-left ${
                location.pathname === "/admin" ? "bg-red-500 text-white" : "text-red-400 hover:bg-red-500 hover:text-white"
              }`}
            >
              <span className="text-lg flex-shrink-0">🛡️</span>
              {sidebarOpen && <span className="text-sm font-medium">Admin Panel</span>}
            </button>
          </div>
        )}
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