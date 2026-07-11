import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    bookings: true,
    reviews: true,
    payments: false,
  });
  const [saved, setSaved] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-[#0a1f5c]">Settings</h1>
            <p className="text-xs text-gray-400">Manage your account preferences</p>
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

        <main className="flex-1 px-8 py-8 max-w-3xl">

          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl">
              ✅ Settings saved successfully!
            </div>
          )}

          {/* Account Info */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">Account Information</h2>
              <p className="text-gray-400 text-sm">Your account details</p>
            </div>
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">User ID</p>
                <p className="text-sm font-medium text-[#0a1f5c]">#{user?.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Role</p>
                <p className="text-sm font-medium text-[#0a1f5c] capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Auth Method</p>
                <p className="text-sm font-medium text-[#0a1f5c]">Google OAuth 2.0</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Account Status</p>
                <span className="inline-block text-xs bg-green-100 text-green-600 px-3 py-0.5 rounded-full font-semibold">Active</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">Notification Preferences</h2>
              <p className="text-gray-400 text-sm">Choose what you want to be notified about</p>
            </div>
            <div className="px-6 py-6 space-y-4">
              {[
                { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                { key: "sms", label: "SMS Notifications", desc: "Receive updates via SMS" },
                { key: "bookings", label: "Booking Updates", desc: "Get notified when bookings change" },
                { key: "reviews", label: "New Reviews", desc: "Get notified when you receive a review" },
                { key: "payments", label: "Payment Alerts", desc: "Get notified about payment activity" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#0a1f5c]">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                    className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${notifications[item.key as keyof typeof notifications] ? "bg-[#1a6ff0]" : "bg-gray-200"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${notifications[item.key as keyof typeof notifications] ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
              <p className="text-gray-400 text-sm">Irreversible account actions</p>
            </div>
            <div className="px-6 py-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#0a1f5c]">Delete Account</p>
                <p className="text-xs text-gray-400">Permanently delete your account and all data</p>
              </div>
              <button className="text-sm bg-red-50 text-red-500 font-semibold px-4 py-2 rounded-xl hover:bg-red-100 transition cursor-pointer">
                Delete Account
              </button>
            </div>
          </div>

          <button onClick={handleSave} className="bg-[#1a6ff0] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#1559c7] transition cursor-pointer shadow-md shadow-blue-200">
            Save Settings
          </button>
        </main>
      </div>
    </div>
  );
}

export default Settings;