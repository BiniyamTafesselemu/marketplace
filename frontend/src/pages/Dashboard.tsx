import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
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

  // Chart data
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
    <div className="min-h-screen bg-[#f5f9ff]">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-xl">🔧</span>
          <span className="font-bold text-[#0a1f5c] text-lg">ServiceHub</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/providers")} className="text-sm text-gray-500 hover:text-[#1a6ff0] transition cursor-pointer">
            Browse Providers
          </button>
          <div className="flex items-center gap-2 bg-[#eaf2ff] px-4 py-2 rounded-full">
            <div className="w-7 h-7 bg-[#1a6ff0] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.role[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-[#0a1f5c] capitalize">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-600 font-medium transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="px-8 lg:px-16 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a1f5c]">Welcome back 👋</h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your bookings</p>
        </div>

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

          {/* Bar Chart */}
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

          {/* Pie Chart */}
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
      </div>
    </div>
  );
}

export default Dashboard;