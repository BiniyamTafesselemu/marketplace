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
  national_id_photo: string;
  trade_license: string;
  skill_certificate: string;
  image: string;
  verification_status: string;
  rejection_reason: string;
  account_status: string;
  suspension_reason: string;
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
    image: "",
    national_id_photo: "",
    trade_license: "",
    skill_certificate: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (key: string, file: File | null) => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setForm(prev => ({ ...prev, [key]: base64 }));
    } catch {
      console.error("Failed to convert file");
    }
  };

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
          image: res.data.image || "",
          national_id_photo: res.data.national_id_photo || "",
          trade_license: res.data.trade_license || "",
          skill_certificate: res.data.skill_certificate || "",
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
        setMessage("Profile updated! Your documents are under review.");
      } else {
        await api.post("/providers/profile", form);
        setMessage("Provider profile created! Awaiting admin verification.");
      }
      setEditing(false);
      const res = await api.get("/providers/profile");
      setProfile(res.data);
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-600";
      case "pending": return "bg-yellow-100 text-yellow-600";
      case "under_review": return "bg-purple-100 text-purple-600";
      case "rejected": return "bg-red-100 text-red-400";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved": return "✅";
      case "pending": return "⏳";
      case "under_review": return "🔍";
      case "rejected": return "❌";
      default: return "❓";
    }
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
            <div className={`mb-6 border text-sm px-4 py-3 rounded-xl ${
              message.includes("Failed") ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"
            }`}>
              {message}
            </div>
          )}

          {/* Verification Status Banner */}
          {profile && (
            <div className={`mb-6 rounded-2xl p-5 border flex items-start gap-4 ${
              profile.verification_status === "approved" ? "bg-green-50 border-green-200" :
              profile.verification_status === "rejected" ? "bg-red-50 border-red-200" :
              profile.verification_status === "under_review" ? "bg-purple-50 border-purple-200" :
              "bg-yellow-50 border-yellow-200"
            }`}>
              <span className="text-2xl">{statusIcon(profile.verification_status)}</span>
              <div>
                <p className="font-semibold text-[#0a1f5c] capitalize">
                  Verification: {profile.verification_status?.replace("_", " ")}
                </p>
                {profile.verification_status === "pending" && <p className="text-sm text-gray-500 mt-1">Awaiting admin review. Usually takes 1-2 business days.</p>}
                {profile.verification_status === "under_review" && <p className="text-sm text-purple-600 mt-1">An admin is currently reviewing your documents.</p>}
                {profile.verification_status === "approved" && <p className="text-sm text-green-600 mt-1">Your profile is approved and visible to customers!</p>}
                {profile.verification_status === "rejected" && (
                  <div>
                    <p className="text-sm text-red-500 mt-1">Your profile was rejected. Please update your documents and resubmit.</p>
                    {profile.rejection_reason && <p className="text-sm text-red-400 mt-1 font-medium">Reason: {profile.rejection_reason}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Status Banner */}
          {profile && profile.account_status !== "active" && (
            <div className="mb-6 rounded-2xl p-5 border bg-red-50 border-red-200 flex items-start gap-4">
              <span className="text-2xl">🚫</span>
              <div>
                <p className="font-semibold text-red-600 capitalize">Account {profile.account_status}</p>
                {profile.suspension_reason && <p className="text-sm text-red-500 mt-1">Reason: {profile.suspension_reason}</p>}
                <p className="text-sm text-gray-500 mt-1">Please contact support for more information.</p>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#0a1f5c] to-[#1a6ff0] px-8 py-10 flex items-center gap-6">
              {profile?.image && profile.image.startsWith("data:") ? (
                <img src={profile.image} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white" />
              ) : (
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-[#1a6ff0] shadow-lg">
                  {user?.role[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white text-xl font-bold">{profile?.business_name || "Your Business"}</p>
                <p className="text-blue-200 text-sm capitalize">{user?.role} · ID #{user?.id}</p>
                {profile && (
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-block text-xs px-3 py-0.5 rounded-full font-semibold capitalize ${statusColor(profile.verification_status)}`}>
                      {statusIcon(profile.verification_status)} {profile.verification_status?.replace("_", " ")}
                    </span>
                    <span className={`inline-block text-xs px-3 py-0.5 rounded-full font-semibold capitalize ${
                      profile.account_status === "active" ? "bg-green-100 text-green-600" :
                      profile.account_status === "suspended" ? "bg-orange-100 text-orange-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {profile.account_status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">
                {profile ? "Provider Profile" : "Become a Provider"}
              </h2>
              <button
                onClick={() => setEditing(!editing)}
                className="text-sm bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition cursor-pointer"
              >
                {editing ? "Cancel" : profile ? "✏️ Edit Profile" : "➕ Create Profile"}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
            ) : !profile && !editing ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <span className="text-5xl mb-4">🔧</span>
                <p className="text-gray-400 font-medium mb-2">No provider profile yet</p>
                <p className="text-gray-300 text-sm mb-6 max-w-md">Create a provider profile and submit your documents for verification.</p>
                <button onClick={() => setEditing(true)} className="bg-[#1a6ff0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
                  Create Provider Profile
                </button>
              </div>
            ) : editing ? (
              <div className="px-8 py-6">

                {/* Info Banner */}
                <div className="bg-[#eaf2ff] border border-[#dbeafe] rounded-xl p-4 mb-6 flex items-start gap-3">
                  <span className="text-lg">ℹ️</span>
                  <div>
                    <p className="text-sm font-semibold text-[#0a1f5c]">Document Verification Required</p>
                    <p className="text-xs text-gray-500 mt-0.5">Upload your documents directly from your device. Your profile will be visible only after admin approval.</p>
                  </div>
                </div>

                {/* Basic Info */}
                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { label: "Business Name", key: "business_name", placeholder: "Abel Plumbing Services" },
                    { label: "Phone Number", key: "phone", placeholder: "0911234567" },
                    { label: "Category ID", key: "category_id", placeholder: "1 (Plumbing), 2 (Electrical)..." },
                    { label: "Starting Price (ETB)", key: "price", placeholder: "500" },
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
                      placeholder="Describe your services, experience, and specialties..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition resize-none"
                    />
                  </div>
                </div>

                {/* Location */}
                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { label: "City", key: "city", placeholder: "Addis Ababa" },
                    { label: "Sub City (Kifle Ketema)", key: "sub_city", placeholder: "Bole" },
                    { label: "Woreda", key: "woreda", placeholder: "03" },
                    { label: "Sefer / Neighborhood", key: "location", placeholder: "Friendship area" },
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
                </div>

                {/* Identity & Documents */}
                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Identity & Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">FAN Number (Tax ID) *</label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={form.FAN_number}
                      onChange={e => setForm({ ...form, FAN_number: e.target.value })}
                      className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition"
                    />
                  </div>

                  {/* Profile Image Upload */}
                  <div>
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Profile Image</label>
                    <div className="border-2 border-dashed border-[#dbeafe] rounded-xl p-4 text-center hover:border-[#1a6ff0] transition cursor-pointer bg-[#f5f9ff]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileChange("image", e.target.files?.[0] || null)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {form.image ? (
                          <img src={form.image} alt="Preview" className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
                        ) : (
                          <div className="text-3xl mb-2">📷</div>
                        )}
                        <p className="text-xs text-[#1a6ff0] font-semibold">{form.image ? "Change Photo" : "Upload Photo"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 5MB</p>
                      </label>
                    </div>
                  </div>

                  {/* Document Uploads */}
                  {[
                    { label: "National ID Photo *", key: "national_id_photo", icon: "🪪", accept: "image/*,.pdf" },
                    { label: "Trade License *", key: "trade_license", icon: "📄", accept: "image/*,.pdf" },
                    { label: "Skill Certificate", key: "skill_certificate", icon: "🎓", accept: "image/*,.pdf" },
                  ].map((f, i) => (
                    <div key={i} className="md:col-span-2">
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">{f.label}</label>
                      <div className={`border-2 border-dashed rounded-xl p-5 hover:border-[#1a6ff0] transition bg-[#f5f9ff] ${
                        form[f.key as keyof typeof form] ? "border-green-400" : "border-[#dbeafe]"
                      }`}>
                        <input
                          type="file"
                          accept={f.accept}
                          onChange={e => handleFileChange(f.key, e.target.files?.[0] || null)}
                          className="hidden"
                          id={`${f.key}-upload`}
                        />
                        <label htmlFor={`${f.key}-upload`} className="cursor-pointer flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                            form[f.key as keyof typeof form] ? "bg-green-100" : "bg-[#eaf2ff]"
                          }`}>
                            {form[f.key as keyof typeof form] ? "✅" : f.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0a1f5c]">
                              {form[f.key as keyof typeof form] ? "File uploaded ✓" : `Upload ${f.label}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Click to select from your device · JPG, PNG, PDF</p>
                          </div>
                          <span className="ml-auto text-xs bg-[#1a6ff0] text-white font-semibold px-3 py-1.5 rounded-lg">
                            {form[f.key as keyof typeof form] ? "Change" : "Choose File"}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#1a6ff0] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#1559c7] transition cursor-pointer disabled:opacity-50 shadow-md shadow-blue-200"
                >
                  {saving ? "Saving..." : profile ? "💾 Update Profile" : "🚀 Submit for Verification"}
                </button>
              </div>
            ) : (
              <div className="px-8 py-6">

                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { label: "Business Name", value: profile?.business_name },
                    { label: "Phone", value: profile?.phone },
                    { label: "Price", value: `ETB ${profile?.price}` },
                    { label: "Category ID", value: profile?.category_id },
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

                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { label: "City", value: profile?.city },
                    { label: "Sub City", value: profile?.sub_city },
                    { label: "Woreda", value: profile?.woreda },
                    { label: "Location / Sefer", value: profile?.location },
                  ].map((f, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{f.label}</p>
                      <p className="text-sm font-medium text-[#0a1f5c]">{f.value || "—"}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Documents</h3>
                <div className="space-y-3">
                  {[
                    { label: "FAN Number", value: profile?.FAN_number, isDoc: false },
                    { label: "National ID Photo", value: profile?.national_id_photo, isDoc: true },
                    { label: "Trade License", value: profile?.trade_license, isDoc: true },
                    { label: "Skill Certificate", value: profile?.skill_certificate, isDoc: true },
                  ].map((f, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${
                      f.value ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span>{f.value ? "✅" : "❌"}</span>
                        <span className="text-sm font-medium text-[#0a1f5c]">{f.label}</span>
                      </div>
                      {f.isDoc ? (
                        f.value ? (
                          <a href={f.value} target="_blank" rel="noreferrer" className="text-xs text-[#1a6ff0] font-semibold hover:underline cursor-pointer">
                            View →
                          </a>
                        ) : (
                          <span className="text-xs text-red-400">Not submitted</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">{f.value || "—"}</span>
                      )}
                    </div>
                  ))}
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