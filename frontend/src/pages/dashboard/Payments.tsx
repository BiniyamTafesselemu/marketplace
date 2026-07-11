import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";

function Payments() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdown, setProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">

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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Paid", value: "ETB 0.00", icon: "💰", color: "bg-green-50 text-green-500" },
              { label: "Pending Payment", value: "ETB 0.00", icon: "⏳", color: "bg-yellow-50 text-yellow-500" },
              { label: "Transactions", value: "0", icon: "📊", color: "bg-blue-50 text-[#1a6ff0]" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-[#0a1f5c]">{s.value}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">Payment Methods</h2>
              <p className="text-gray-400 text-sm">Supported payment options via Chapa</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              {[
                { name: "Telebirr", icon: "📱", color: "bg-purple-50" },
                { name: "CBE Birr", icon: "🏦", color: "bg-blue-50" },
                { name: "Amole", icon: "💳", color: "bg-green-50" },
                { name: "HelloCash", icon: "💵", color: "bg-yellow-50" },
              ].map((m, i) => (
                <div key={i} className={`${m.color} rounded-2xl p-4 text-center`}>
                  <div className="text-3xl mb-2">{m.icon}</div>
                  <p className="text-sm font-semibold text-[#0a1f5c]">{m.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">Payment History</h2>
              <p className="text-gray-400 text-sm">All your transactions</p>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-4">💳</span>
              <p className="text-gray-400 font-medium mb-2">No payments yet</p>
              <p className="text-gray-300 text-sm mb-6">Payment integration coming soon via Chapa</p>
              <div className="inline-block bg-[#eaf2ff] text-[#1a6ff0] text-xs font-semibold px-4 py-2 rounded-full">
                🔒 Secured by Chapa
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Payments;