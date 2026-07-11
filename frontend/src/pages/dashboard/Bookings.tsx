import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Booking {
  id: number;
  provider_id: number;
  date: string;
  status: string;
  createdAt: string;
}

interface Provider {
  id: number;
  business_name: string;
  phone: string;
  city: string;
  category_id: number;
}

function Bookings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Record<number, Provider>>({});
  const [loading, setLoading] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRes = await api.get("/bookings");
        setBookings(bookingsRes.data);

        // Fetch all providers
        const providersRes = await api.get("/providers");
        const providerMap: Record<number, Provider> = {};
        providersRes.data.forEach((p: Provider) => {
          providerMap[p.id] = p;
        });
        setProviders(providerMap);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(bookings.filter(b => b.id !== id));
    } catch (error) {
      console.error("Failed to cancel booking", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredBookings = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => {
      const providerName = providers[b.provider_id]?.business_name?.toLowerCase() || "";
      return providerName.includes(search.toLowerCase()) || b.id.toString().includes(search);
    });

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: "📋", color: "bg-blue-50 text-[#1a6ff0]", trend: "+2 this month" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, icon: "⏳", color: "bg-yellow-50 text-yellow-500", trend: "Awaiting response" },
    { label: "Accepted", value: bookings.filter(b => b.status === "accepted").length, icon: "✅", color: "bg-green-50 text-green-500", trend: "Ready to go" },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, icon: "🏆", color: "bg-purple-50 text-purple-500", trend: "Great job!" },
  ];

  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate >= new Date() && b.status !== "cancelled";
  });

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-[#0a1f5c]">My Bookings</h1>
            <p className="text-xs text-gray-400">Manage all your service bookings</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 bg-[#eaf2ff] rounded-full flex items-center justify-center hover:bg-[#dbeafe] transition cursor-pointer">
              <span className="text-sm">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative">
              <button onClick={() => setProfileDropdown(!profileDropdown)} className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1a6ff0] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.role[0].toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-[#0a1f5c] capitalize">{user?.role}</p>
                  <p className="text-xs text-gray-400">ID #{user?.id}</p>
                </div>
                <span className="text-gray-400 text-xs">▼</span>
              </button>
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
                    <button key={i} onClick={() => { navigate(item.path); setProfileDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-[#eaf2ff] hover:text-[#1a6ff0] transition cursor-pointer">
                      <span>{item.icon}</span><span>{item.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-50 transition cursor-pointer">
                      <span>🚪</span><span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-[#0a1f5c]">{s.value}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
                <p className="text-xs text-[#1a6ff0] mt-1">{s.trend}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-base font-bold text-[#0a1f5c]">Upcoming Bookings</h2>
                <p className="text-gray-400 text-xs">{upcomingBookings.length} scheduled</p>
              </div>
              {upcomingBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <span className="text-3xl mb-2">📅</span>
                  <p className="text-gray-400 text-sm">No upcoming bookings</p>
                  <button onClick={() => navigate("/providers")} className="mt-3 text-xs text-[#1a6ff0] font-semibold hover:underline cursor-pointer">
                    Book a service →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {upcomingBookings.slice(0, 3).map(b => (
                    <div key={b.id} className="px-6 py-4 hover:bg-[#f5f9ff] transition">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[#0a1f5c]">
                          {providers[b.provider_id]?.business_name || `Provider #${b.provider_id}`}
                        </p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          b.status === "accepted" ? "bg-blue-100 text-[#1a6ff0]" : "bg-yellow-100 text-yellow-600"
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">📅 {new Date(b.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-base font-bold text-[#0a1f5c]">Recent Activity</h2>
                <p className="text-gray-400 text-xs">Latest booking activity</p>
              </div>
              {recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="text-3xl mb-2">🕐</span>
                  <p className="text-gray-400 text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentBookings.map(b => (
                    <div key={b.id} className="px-6 py-4 hover:bg-[#f5f9ff] transition">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#eaf2ff] rounded-full flex items-center justify-center text-sm flex-shrink-0">
                          {b.status === "completed" ? "✅" : b.status === "pending" ? "⏳" : b.status === "accepted" ? "📋" : "❌"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0a1f5c]">
                            {providers[b.provider_id]?.business_name || `Provider #${b.provider_id}`}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">{b.status} · {new Date(b.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-base font-bold text-[#0a1f5c]">Quick Actions</h2>
                <p className="text-gray-400 text-xs">What would you like to do?</p>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { icon: "🔍", label: "Browse Providers", desc: "Find a new service", path: "/providers" },
                  { icon: "⭐", label: "Leave a Review", desc: "Rate your experience", path: "/dashboard/reviews" },
                  { icon: "👤", label: "Update Profile", desc: "Manage your account", path: "/dashboard/profile" },
                  { icon: "💳", label: "Payment History", desc: "View transactions", path: "/dashboard/payments" },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#eaf2ff] transition cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 bg-[#eaf2ff] rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0a1f5c]">{action.label}</p>
                      <p className="text-xs text-gray-400">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 border-b border-gray-50 gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0a1f5c]">All Bookings</h2>
                <p className="text-gray-400 text-sm">{filteredBookings.length} bookings found</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">

                {/* Search */}
                <div className="flex items-center gap-2 bg-[#f5f9ff] border border-[#dbeafe] rounded-xl px-3 py-2">
                  <span className="text-gray-400 text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder="Search provider..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent text-sm text-gray-600 outline-none w-36 placeholder-gray-300"
                  />
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                  {["all", "pending", "accepted", "completed", "cancelled"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer capitalize ${
                        filter === f ? "bg-[#1a6ff0] text-white" : "bg-[#eaf2ff] text-gray-500 hover:bg-[#dbeafe]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/providers")}
                  className="bg-[#1a6ff0] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1559c7] transition cursor-pointer"
                >
                  + New Booking
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">📋</span>
                <p className="text-gray-400 font-medium mb-2">No bookings found</p>
                <p className="text-gray-300 text-sm mb-6">Try adjusting your filters or book a new service</p>
                <button onClick={() => navigate("/providers")} className="bg-[#1a6ff0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
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
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Booked On</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.map((b) => {
                      const provider = providers[b.provider_id];
                      return (
                        <tr key={b.id} className="hover:bg-[#f5f9ff] transition">
                          <td className="px-6 py-4 text-sm text-gray-500">#{b.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#dbeafe] rounded-full flex items-center justify-center text-xs font-bold text-[#1a6ff0] flex-shrink-0">
                                {provider?.business_name?.[0] || "P"}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#0a1f5c]">
                                  {provider?.business_name || `Provider #${b.provider_id}`}
                                </p>
                                <p className="text-xs text-gray-400">{provider?.phone || ""}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{provider?.city || "—"}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
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
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => navigate(`/dashboard/reviews`)}
                                className="text-xs text-[#1a6ff0] hover:underline font-medium cursor-pointer"
                              >
                                Review
                              </button>
                              {b.status === "pending" && (
                                <button
                                  onClick={() => handleDelete(b.id)}
                                  className="text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer transition"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

export default Bookings;