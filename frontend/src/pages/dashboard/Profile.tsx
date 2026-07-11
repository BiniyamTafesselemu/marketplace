import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface ProviderProfile {
  id: number;
  business_name: string;
  phone: string;
  description: string;
  city: string;
  sub_city: string;
  woreda: string;
  location: string;
  price: string;
  FAN_number: string;
  category_id: number;
}

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    phone: "",
    description: "",
    city: "",
    sub_city: "",
    woreda: "",
    location: "",
    price: "",
    FAN_number: "",
    category_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/providers/profile");
        setProfile(res.data);
        setForm({
          business_name: res.data.business_name || "",
          phone: res.data.phone || "",
          description: res.data.description || "",
          city: res.data.city || "",
          sub_city: res.data.sub_city || "",
          woreda: res.data.woreda || "",
          location: res.data.location || "",
          price: res.data.price || "",
          FAN_number: res.data.FAN_number || "",
          category_id: res.data.category_id || "",
        });
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile) {
        await api.put("/providers/profile", form);
        setMessage("Profile updated successfully!");
      } else {
        await api.post("/providers/profile", form);
        setMessage("Provider profile created!");
      }
      setEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-lg font-bold text-[#0a1f5c]">My Profile</h1>
            <p className="text-xs text-gray-400">Manage your provider profile</p>
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

          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl">
              {message}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#0a1f5c] to-[#1a6ff0] px-8 py-10 flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-[#1a6ff0] shadow-lg">
                {user?.role[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white text-xl font-bold capitalize">{user?.role}</p>
                <p className="text-blue-200 text-sm">ID #{user?.id}</p>
                {profile && <span className="inline-block mt-2 text-xs bg-green-400 text-white px-3 py-0.5 rounded-full font-medium">Provider Active</span>}
              </div>
            </div>

            <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">
                {profile ? "Provider Profile" : "Create Provider Profile"}
              </h2>
              <button
                onClick={() => setEditing(!editing)}
                className="text-sm bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition cursor-pointer"
              >
                {editing ? "Cancel" : profile ? "Edit Profile" : "Create Profile"}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
            ) : !profile && !editing ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">👤</span>
                <p className="text-gray-400 font-medium mb-2">No provider profile yet</p>
                <p className="text-gray-300 text-sm mb-6">Create a provider profile to start offering services</p>
                <button onClick={() => setEditing(true)} className="bg-[#1a6ff0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
                  Create Profile
                </button>
              </div>
            ) : editing ? (
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Business Name", key: "business_name", placeholder: "Abel Plumbing" },
                    { label: "Phone", key: "phone", placeholder: "0911234567" },
                    { label: "Category ID", key: "category_id", placeholder: "1" },
                    { label: "Price (ETB)", key: "price", placeholder: "500" },
                    { label: "City", key: "city", placeholder: "Addis Ababa" },
                    { label: "Sub City", key: "sub_city", placeholder: "Bole" },
                    { label: "Woreda", key: "woreda", placeholder: "03" },
                    { label: "Location / Sefer", key: "location", placeholder: "Friendship area" },
                    { label: "FAN Number", key: "FAN_number", placeholder: "1234567890" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Description</label>
                    <textarea
                      placeholder="Describe your services..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-6 bg-[#1a6ff0] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#1559c7] transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            ) : (
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Business Name", value: profile?.business_name },
                    { label: "Phone", value: profile?.phone },
                    { label: "Price", value: `ETB ${profile?.price}` },
                    { label: "City", value: profile?.city },
                    { label: "Sub City", value: profile?.sub_city },
                    { label: "Woreda", value: profile?.woreda },
                    { label: "Location", value: profile?.location },
                    { label: "FAN Number", value: profile?.FAN_number },
                  ].map((f, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{f.label}</p>
                      <p className="text-sm font-medium text-[#0a1f5c]">{f.value || "—"}</p>
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                    <p className="text-sm text-gray-600">{profile?.description || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;