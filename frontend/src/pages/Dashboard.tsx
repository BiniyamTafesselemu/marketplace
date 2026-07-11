import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Booking {
  id: number;
  provider_id: number;
  date: string;
  status: string;
  createdAt: string;
}

const COLORS = ["#1a6ff0", "#60a5fa", "#34d399", "#f59e0b"];

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings");
        setBookings(res.data);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const statusData = [
    { name: "Pending", value: bookings.filter(b => b.status === "pending").length },
    { name: "Accepted", value: bookings.filter(b => b.status === "accepted").length },
    { name: "Completed", value: bookings.filter(b => b.status === "completed").length },
    { name: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length },
  ].filter(d => d.value > 0);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString("default", { month: "short" });
    const count = bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).length;
    return { month, bookings: count };
  });

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: "📋", color: "bg-blue-50 text-[#1a6ff0]" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, icon: "⏳", color: "bg-yellow-50 text-yellow-500" },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, icon: "✅", color: "bg-green-50 text-green-500" },
    { label: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length, icon: "❌", color: "bg-red-50 text-red-400" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-[#0a1f5c]">Dashboard</h1>
            <p className="text-xs text-gray-400">Welcome back!</p>
          </div>

          <div className="flex items-center gap-4">

            {/* Notification Bell */}
            <button className="relative w-9 h-9 bg-[#eaf2ff] rounded-full flex items-center justify-center hover:bg-[#dbeafe] transition cursor-pointer">
              <span className="text-sm">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-[#f5f9ff] border border-[#dbeafe] rounded-xl px-4 py-2">
              <span className="text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-gray-600 outline-none w-40 placeholder-gray-300"
              />
            </div>

            {/* Profile Picture */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#1a6ff0] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.role[0].toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-[#0a1f5c] capitalize">{user?.role}</p>
                  <p className="text-xs text-gray-400">ID #{user?.id}</p>
                </div>
                <span className="text-gray-400 text-xs">▼</span>
              </button>

              {/* Dropdown */}
              {profileDropdown && (
                <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 w-48 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-[#0a1f5c] capitalize">{user?.role}</p>
                    <p className="text-xs text-gray-400">ID #{user?.id}</p>
                  </div>
                  {[
                    { icon: "👤", label: "My Profile", path: "/dashboard/profile" },
                    { icon: "⚙️", label: "Settings", path: "/dashboard/settings" },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { navigate(item.path); setProfileDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-[#eaf2ff] hover:text-[#1a6ff0] transition cursor-pointer"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-50 transition cursor-pointer"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-8 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${s.color}`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-bold text-[#0a1f5c]">{s.value}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0a1f5c] mb-1">Bookings Over Time</h2>
              <p className="text-gray-400 text-sm mb-6">Last 6 months activity</p>
              {bookings.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No booking data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eaf2ff" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="bookings" fill="#1a6ff0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0a1f5c] mb-1">Booking Status</h2>
              <p className="text-gray-400 text-sm mb-6">Breakdown by status</p>
              {statusData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No booking data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <div>
                <h2 className="text-lg font-bold text-[#0a1f5c]">My Bookings</h2>
                <p className="text-gray-400 text-sm">All your service bookings</p>
              </div>
              <button
                onClick={() => navigate("/providers")}
                className="bg-[#1a6ff0] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1559c7] transition cursor-pointer"
              >
                + New Booking
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">📋</span>
                <p className="text-gray-400 font-medium mb-2">No bookings yet</p>
                <p className="text-gray-300 text-sm mb-6">Browse providers and make your first booking!</p>
                <button
                  onClick={() => navigate("/providers")}
                  className="bg-[#1a6ff0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer"
                >
                  Browse Providers
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f5f9ff]">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">ID</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Provider</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#f5f9ff] transition">
                        <td className="px-6 py-4 text-sm text-gray-500">#{b.id}</td>
                        <td className="px-6 py-4 text-sm text-[#0a1f5c] font-medium">Provider #{b.provider_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                            b.status === "completed" ? "bg-green-100 text-green-600" :
                            b.status === "pending" ? "bg-yellow-100 text-yellow-600" :
                            b.status === "accepted" ? "bg-blue-100 text-[#1a6ff0]" :
                            "bg-red-100 text-red-400"
                          }`}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;