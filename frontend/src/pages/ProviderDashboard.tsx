import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

interface Booking {
  id: number;
  customer_id: number;
  provider_id: number;
  date: string;
  status: string;
  createdAt: string;
}

interface ServiceItem {
  id: number;
  service: string;
  price: string;
  status: string;
  payment_method: string;
  payment_account: string;
  description: string;
  rejection_reason?: string;
}

interface ProviderProfile {
  id: number;
  business_name: string;
  verification_status: string;
  account_status: string;
  city: string;
  image: string;
}

const COLORS = ["#f59e0b", "#1a6ff0", "#34d399", "#ef4444"];

const serviceIcons: Record<string, string> = {
  "Plumbing": "🔧", "Electrical": "⚡", "Cleaning": "🧹",
  "Painting": "🎨", "Carpentry": "🪚", "AC Repair": "❄️",
  "Auto Service": "🚗", "Electronics": "📱", "Masonry": "🧱",
  "Welding": "🔥", "Tiling": "🪟", "Landscaping": "🌿",
  "Moving": "📦", "Security": "🔒", "IT Support": "💻"
};

const bookingStatusColor = (status: string) => {
  switch (status) {
    case "accepted": return "bg-blue-100 text-[#1a6ff0]";
    case "pending": return "bg-yellow-100 text-yellow-600";
    case "completed": return "bg-green-100 text-green-600";
    case "cancelled": return "bg-gray-100 text-gray-500";
    case "rejected": return "bg-red-100 text-red-400";
    default: return "bg-gray-100 text-gray-500";
  }
};

function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "services">("overview");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [bookingFilter, setBookingFilter] = useState("all");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setServicesLoading(true);
    try {
      // Fetch bookings and profile in parallel
      const [bookingsRes, profileRes] = await Promise.all([
        api.get("/bookings/provider/all"),
        api.get("/providers/profile")
      ]);
      setBookings(bookingsRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      console.error("Failed to fetch provider data", error);
    } finally {
      setLoading(false);
    }

    // Fetch services separately
    try {
      const servicesRes = await api.get("/services/my");
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Failed to fetch services", error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/provider/all");
      setBookings(res.data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await api.get("/services/my");
      setServices(res.data);
    } catch (error) {
      console.error("Failed to fetch services", error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleBookingStatus = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      const res = await api.put(`/bookings/provider/${id}/status`, { status });
      // Update locally immediately
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: res.data.status } : b));
      setMessage(`Booking ${status} successfully!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to update booking", error);
      setMessage(error?.response?.data?.message || "Failed to update booking");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  // All booking statuses
  const allStatuses = ["all", "pending", "accepted", "completed", "rejected", "cancelled"];

  const filteredBookings = bookings.filter(b =>
    bookingFilter === "all" ? true : b.status === bookingFilter
  );

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: "📋", color: "bg-blue-50 text-[#1a6ff0]" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, icon: "⏳", color: "bg-yellow-50 text-yellow-500" },
    { label: "Accepted", value: bookings.filter(b => b.status === "accepted").length, icon: "✅", color: "bg-green-50 text-green-500" },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, icon: "🏆", color: "bg-purple-50 text-purple-500" },
  ];

  const statusData = [
    { name: "Pending", value: bookings.filter(b => b.status === "pending").length },
    { name: "Accepted", value: bookings.filter(b => b.status === "accepted").length },
    { name: "Completed", value: bookings.filter(b => b.status === "completed").length },
    { name: "Rejected", value: bookings.filter(b => b.status === "rejected").length },
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

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const approvedServices = services.filter(s => s.status === "approved").length;
  const pendingServices = services.filter(s => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-[#0a1f5c]">Provider Dashboard</h1>
            <p className="text-xs text-gray-400">{profile?.business_name || "Manage your services and bookings"}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 bg-[#eaf2ff] rounded-full flex items-center justify-center hover:bg-[#dbeafe] transition cursor-pointer">
              <span className="text-sm">🔔</span>
              {pendingBookings.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <div className="relative">
              <button onClick={() => setProfileDropdown(!profileDropdown)} className="flex items-center gap-2 cursor-pointer">
                {profile?.image ? (
                  <img src={profile.image} alt="" className="w-10 h-10 rounded-full object-cover shadow-md" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a6ff0] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user?.role[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-[#0a1f5c]">{profile?.business_name || "Provider"}</p>
                  <p className="text-xs text-gray-400 capitalize">{profile?.verification_status?.replace("_", " ") || "pending"}</p>
                </div>
                <span className="text-gray-400 text-xs">▼</span>
              </button>
              {profileDropdown && (
                <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 w-48 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-[#0a1f5c]">{profile?.business_name || "Provider"}</p>
                    <p className="text-xs text-gray-400">Provider Account</p>
                  </div>
                  {[
                    { icon: "👤", label: "Edit Profile", path: "/dashboard/profile" },
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

          {message && (
            <div className={`mb-6 border text-sm px-4 py-3 rounded-xl ${
              message.includes("Failed") ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"
            }`}>
              {message}
            </div>
          )}

          {/* Profile Status Banner */}
          {profile && profile.verification_status !== "approved" && (
            <div className={`mb-6 rounded-2xl p-5 border flex items-start gap-4 ${
              profile.verification_status === "pending" ? "bg-yellow-50 border-yellow-200" :
              profile.verification_status === "under_review" ? "bg-purple-50 border-purple-200" :
              "bg-red-50 border-red-200"
            }`}>
              <span className="text-2xl">
                {profile.verification_status === "pending" ? "⏳" :
                 profile.verification_status === "under_review" ? "🔍" : "❌"}
              </span>
              <div>
                <p className="font-semibold text-[#0a1f5c] capitalize">
                  Profile Status: {profile.verification_status.replace("_", " ")}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {profile.verification_status === "pending" && "Your profile is awaiting admin review. Services won't be visible until approved."}
                  {profile.verification_status === "under_review" && "An admin is currently reviewing your profile and documents."}
                  {profile.verification_status === "rejected" && "Your profile was rejected. Please update your documents and resubmit."}
                </p>
                <button onClick={() => navigate("/dashboard/profile")} className="text-xs text-[#1a6ff0] font-semibold hover:underline cursor-pointer mt-1">
                  View Profile →
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-3 mb-8 flex-wrap">
            {[
              { key: "overview" as const, label: "Overview", icon: "🏠", badge: null },
              { key: "bookings" as const, label: "Bookings", icon: "📋", badge: pendingBookings.length > 0 ? pendingBookings.length : null },
              { key: "services" as const, label: "My Services", icon: "🔨", badge: null },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === "services") fetchServices();
                  if (tab.key === "bookings") fetchBookings();
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  activeTab === tab.key ? "bg-[#1a6ff0] text-white shadow-md" : "bg-white text-gray-500 hover:bg-[#eaf2ff]"
                }`}
              >
                {tab.icon} {tab.label}
                {tab.badge !== null && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* ===== OVERVIEW ===== */}
          {activeTab === "overview" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${s.color}`}>{s.icon}</div>
                    <p className="text-2xl font-bold text-[#0a1f5c]">{s.value}</p>
                    <p className="text-gray-400 text-sm">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Services Summary */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-[#0a1f5c] mb-4">Services Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span>✅</span>
                        <span className="text-sm font-medium text-[#0a1f5c]">Approved</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{approvedServices}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span>⏳</span>
                        <span className="text-sm font-medium text-[#0a1f5c]">Pending Review</span>
                      </div>
                      <span className="text-lg font-bold text-yellow-600">{pendingServices}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#eaf2ff] rounded-xl">
                      <div className="flex items-center gap-2">
                        <span>📊</span>
                        <span className="text-sm font-medium text-[#0a1f5c]">Total</span>
                      </div>
                      <span className="text-lg font-bold text-[#1a6ff0]">{services.length}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate("/dashboard/profile")} className="w-full mt-4 text-xs bg-[#1a6ff0] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
                    + Add New Service
                  </button>
                </div>

                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-[#0a1f5c] mb-1">Bookings Over Time</h3>
                  <p className="text-gray-400 text-sm mb-4">Last 6 months</p>
                  {bookings.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No bookings yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eaf2ff" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="bookings" fill="#1a6ff0" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Pending Bookings */}
              {pendingBookings.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                  <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#0a1f5c]">Bookings Awaiting Response</h2>
                      <p className="text-gray-400 text-sm">These need your attention</p>
                    </div>
                    <span className="bg-red-100 text-red-500 text-xs font-semibold px-3 py-1 rounded-full">
                      {pendingBookings.length} pending
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {pendingBookings.map(b => (
                      <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#f5f9ff] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-xl">⏳</div>
                          <div>
                            <p className="text-sm font-semibold text-[#0a1f5c]">Booking #{b.id}</p>
                            <p className="text-xs text-gray-400">Customer #{b.customer_id}</p>
                            <p className="text-xs text-gray-400">Requested: {new Date(b.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleBookingStatus(b.id, "accepted")}
                            disabled={actionLoading === b.id}
                            className="text-xs bg-green-500 text-white font-semibold px-4 py-2 rounded-xl hover:bg-green-600 transition cursor-pointer disabled:opacity-50"
                          >
                            {actionLoading === b.id ? "..." : "✅ Accept"}
                          </button>
                          <button
                            onClick={() => handleBookingStatus(b.id, "rejected")}
                            disabled={actionLoading === b.id}
                            className="text-xs bg-red-100 text-red-500 font-semibold px-4 py-2 rounded-xl hover:bg-red-200 transition cursor-pointer disabled:opacity-50"
                          >
                            {actionLoading === b.id ? "..." : "❌ Reject"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pie Chart */}
              {statusData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-[#0a1f5c] mb-1">Booking Status Breakdown</h3>
                  <p className="text-gray-400 text-sm mb-4">All time overview</p>
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
                </div>
              )}
            </>
          )}

          {/* ===== BOOKINGS TAB ===== */}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#0a1f5c]">All Bookings</h2>
                  <p className="text-gray-400 text-sm">{filteredBookings.length} shown</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {allStatuses.map(f => {
                    const count = f === "all" ? bookings.length : bookings.filter(b => b.status === f).length;
                    if (count === 0 && f !== "all") return null;
                    return (
                      <button
                        key={f}
                        onClick={() => setBookingFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer capitalize ${
                          bookingFilter === f ? "bg-[#1a6ff0] text-white" : "bg-[#eaf2ff] text-gray-500 hover:bg-[#dbeafe]"
                        }`}
                      >
                        {f} ({count})
                      </button>
                    );
                  })}
                  <button onClick={fetchBookings} className="text-xs bg-gray-100 text-gray-500 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer">
                    🔄
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl mb-4">📋</span>
                  <p className="text-gray-400 font-medium mb-1">No {bookingFilter !== "all" ? bookingFilter : ""} bookings</p>
                  <p className="text-gray-300 text-sm">Bookings from customers will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredBookings.map(b => (
                    <div key={b.id} className="px-6 py-5 hover:bg-[#f5f9ff] transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                            b.status === "pending" ? "bg-yellow-50" :
                            b.status === "accepted" ? "bg-blue-50" :
                            b.status === "completed" ? "bg-green-50" :
                            "bg-red-50"
                          }`}>
                            {b.status === "pending" ? "⏳" : b.status === "accepted" ? "✅" : b.status === "completed" ? "🏆" : "❌"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-[#0a1f5c]">Booking #{b.id}</p>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${bookingStatusColor(b.status)}`}>
                                {b.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">Customer #{b.customer_id}</p>
                            <p className="text-xs text-gray-400 mt-0.5">📅 Requested: {new Date(b.date).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-300">Received: {new Date(b.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {b.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleBookingStatus(b.id, "accepted")}
                                disabled={actionLoading === b.id}
                                className="text-xs bg-green-500 text-white font-semibold px-4 py-2 rounded-xl hover:bg-green-600 transition cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading === b.id ? "..." : "✅ Accept"}
                              </button>
                              <button
                                onClick={() => handleBookingStatus(b.id, "rejected")}
                                disabled={actionLoading === b.id}
                                className="text-xs bg-red-100 text-red-500 font-semibold px-4 py-2 rounded-xl hover:bg-red-200 transition cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading === b.id ? "..." : "❌ Reject"}
                              </button>
                            </>
                          )}
                          {b.status === "accepted" && (
                            <button
                              onClick={() => handleBookingStatus(b.id, "completed")}
                              disabled={actionLoading === b.id}
                              className="text-xs bg-[#1a6ff0] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#1559c7] transition cursor-pointer disabled:opacity-50"
                            >
                              {actionLoading === b.id ? "..." : "🏆 Mark Complete"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== SERVICES TAB ===== */}
          {activeTab === "services" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0a1f5c]">My Services</h2>
                  <p className="text-gray-400 text-sm">{services.length} services · {approvedServices} approved</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={fetchServices} className="text-xs bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition cursor-pointer">
                    🔄 Refresh
                  </button>
                  <button onClick={() => navigate("/dashboard/profile")} className="bg-[#1a6ff0] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
                    + Add Service
                  </button>
                </div>
              </div>

              {servicesLoading ? (
                <div className="bg-white rounded-2xl shadow-sm flex items-center justify-center py-16 text-gray-300">
                  Loading services...
                </div>
              ) : services.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl mb-4">🔨</span>
                  <p className="text-gray-400 font-medium mb-2">No services yet</p>
                  <p className="text-gray-300 text-sm mb-6">Add services from your provider profile to start receiving bookings</p>
                  <button onClick={() => navigate("/dashboard/profile")} className="bg-[#1a6ff0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
                    Go to Profile → Add Service
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(svc => (
                    <div key={svc.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#eaf2ff] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {serviceIcons[svc.service] || "🔨"}
                          </div>
                          <div>
                            <p className="font-bold text-[#0a1f5c]">{svc.service}</p>
                            <p className="text-sm font-bold text-[#1a6ff0]">ETB {svc.price}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize flex-shrink-0 ${
                          svc.status === "approved" ? "bg-green-100 text-green-600" :
                          svc.status === "pending" ? "bg-yellow-100 text-yellow-600" :
                          "bg-red-100 text-red-400"
                        }`}>
                          {svc.status}
                        </span>
                      </div>

                      {svc.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{svc.description}</p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                        <span>💳</span>
                        <span>{svc.payment_method} · {svc.payment_account}</span>
                      </div>

                      {svc.status === "pending" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700 mb-3">
                          ⏳ Awaiting admin approval — not yet visible to customers
                        </div>
                      )}
                      {svc.status === "rejected" && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-500 mb-3">
                          ❌ Rejected{svc.rejection_reason ? `: ${svc.rejection_reason}` : ""} — please update and resubmit
                        </div>
                      )}
                      {svc.status === "approved" && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-600 mb-3">
                          ✅ Visible to customers in Browse Providers
                        </div>
                      )}

                      <button
                        onClick={() => navigate("/dashboard/profile")}
                        className="w-full text-xs bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition cursor-pointer"
                      >
                        Edit Service →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProviderDashboard;