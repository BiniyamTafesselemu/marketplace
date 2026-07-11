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
}

interface Provider {
  id: number;
  business_name: string;
  price: string;
  city: string;
}

function Payments() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Record<number, Provider>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRes = await api.get("/bookings");
        setBookings(bookingsRes.data);

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const completedBookings = bookings.filter(b => b.status === "completed");
  const pendingBookings = bookings.filter(b => b.status === "pending" || b.status === "accepted");

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-[#0a1f5c]">Payments</h1>
            <p className="text-xs text-gray-400">Your payment history and methods</p>
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

          {/* Chapa Banner */}
          <div className="bg-gradient-to-r from-[#0a1f5c] to-[#1a6ff0] rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg mb-1">Payment Integration Coming Soon</p>
              <p className="text-blue-100 text-sm">We're integrating Chapa for seamless Ethiopian payments</p>
              <div className="flex items-center gap-3 mt-3">
                {["Telebirr", "CBE Birr", "Amole", "HelloCash"].map((m, i) => (
                  <span key={i} className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">{m}</span>
                ))}
              </div>
            </div>
            <div className="text-5xl hidden md:block">🔒</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Paid", value: "ETB 0.00", icon: "💰", color: "bg-green-50 text-green-500", sub: "0 transactions" },
              { label: "Pending Payment", value: "ETB 0.00", icon: "⏳", color: "bg-yellow-50 text-yellow-500", sub: `${pendingBookings.length} bookings` },
              { label: "Completed Services", value: completedBookings.length.toString(), icon: "✅", color: "bg-blue-50 text-[#1a6ff0]", sub: "Services received" },
              { label: "Active Bookings", value: pendingBookings.length.toString(), icon: "📋", color: "bg-purple-50 text-purple-500", sub: "In progress" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-[#0a1f5c]">{s.value}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
                <p className="text-xs text-[#1a6ff0] mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Payment Methods */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-lg font-bold text-[#0a1f5c]">Supported Payment Methods</h2>
                <p className="text-gray-400 text-sm">Available via Chapa payment gateway</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                {[
                  { name: "Telebirr", icon: "📱", color: "bg-purple-50 border-purple-100", desc: "Ethio Telecom" },
                  { name: "CBE Birr", icon: "🏦", color: "bg-blue-50 border-blue-100", desc: "Commercial Bank" },
                  { name: "Amole", icon: "💳", color: "bg-green-50 border-green-100", desc: "Dashen Bank" },
                  { name: "HelloCash", icon: "💵", color: "bg-yellow-50 border-yellow-100", desc: "Amhara Bank" },
                  { name: "M-Pesa", icon: "📲", color: "bg-red-50 border-red-100", desc: "Safaricom" },
                  { name: "Visa", icon: "💳", color: "bg-indigo-50 border-indigo-100", desc: "International" },
                  { name: "Mastercard", icon: "🌐", color: "bg-orange-50 border-orange-100", desc: "International" },
                  { name: "Bank Transfer", icon: "🏛️", color: "bg-gray-50 border-gray-100", desc: "Direct transfer" },
                ].map((m, i) => (
                  <div key={i} className={`${m.color} border rounded-2xl p-4 text-center hover:shadow-sm transition`}>
                    <div className="text-2xl mb-2">{m.icon}</div>
                    <p className="text-sm font-bold text-[#0a1f5c]">{m.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-base font-bold text-[#0a1f5c]">How Payments Work</h2>
                <p className="text-gray-400 text-xs">Simple and secure process</p>
              </div>
              <div className="p-6 space-y-5">
                {[
                  { step: "1", title: "Book a Service", desc: "Choose a provider and book", icon: "📋" },
                  { step: "2", title: "Service Accepted", desc: "Provider confirms your booking", icon: "✅" },
                  { step: "3", title: "Pay via Chapa", desc: "Use Telebirr, CBE Birr & more", icon: "💳" },
                  { step: "4", title: "Service Completed", desc: "Provider delivers the service", icon: "🏆" },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#eaf2ff] rounded-full flex items-center justify-center text-xs font-bold text-[#1a6ff0] flex-shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0a1f5c]">{s.title}</p>
                      <p className="text-xs text-gray-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">Bookings Awaiting Payment</h2>
              <p className="text-gray-400 text-sm">Services you've booked that need payment</p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-300">Loading...</div>
            ) : pendingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3">✅</span>
                <p className="text-gray-400 font-medium">No pending payments</p>
                <p className="text-gray-300 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingBookings.map(b => {
                  const provider = providers[b.provider_id];
                  return (
                    <div key={b.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#f5f9ff] transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#dbeafe] rounded-full flex items-center justify-center text-sm font-bold text-[#1a6ff0]">
                          {provider?.business_name?.[0] || "P"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0a1f5c]">{provider?.business_name || `Provider #${b.provider_id}`}</p>
                          <p className="text-xs text-gray-400">{provider?.city || ""} · {new Date(b.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#0a1f5c]">ETB {provider?.price || "—"}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            b.status === "accepted" ? "bg-blue-100 text-[#1a6ff0]" : "bg-yellow-100 text-yellow-600"
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <button className="text-xs bg-[#1a6ff0] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#1559c7] transition cursor-pointer opacity-50" disabled>
                          Pay Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">Payment History</h2>
              <p className="text-gray-400 text-sm">All completed transactions</p>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-4">💳</span>
              <p className="text-gray-400 font-medium mb-2">No payment history yet</p>
              <p className="text-gray-300 text-sm mb-6">Your transactions will appear here once Chapa is activated</p>
              <div className="flex items-center gap-2 bg-[#eaf2ff] text-[#1a6ff0] text-xs font-semibold px-4 py-2 rounded-full">
                <span>🔒</span>
                <span>Secured by Chapa Payment Gateway</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Payments;