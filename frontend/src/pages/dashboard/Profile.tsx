import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface ServiceItem {
  service: string;
  trade_license: string;
  skill_certificate: string;
}

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
  services: ServiceItem[];
  image: string;
  verification_status: string;
  rejection_reason: string;
  account_status: string;
  suspension_reason: string;
}

interface FormErrors {
  [key: string]: string;
}

const ALL_SERVICES = [
  "Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry",
  "AC Repair", "Auto Service", "Electronics", "Masonry", "Welding",
  "Tiling", "Landscaping", "Moving", "Security", "IT Support"
];

const serviceIcons: Record<string, string> = {
  "Plumbing": "🔧", "Electrical": "⚡", "Cleaning": "🧹",
  "Painting": "🎨", "Carpentry": "🪚", "AC Repair": "❄️",
  "Auto Service": "🚗", "Electronics": "📱", "Masonry": "🧱",
  "Welding": "🔥", "Tiling": "🪟", "Landscaping": "🌿",
  "Moving": "📦", "Security": "🔒", "IT Support": "💻"
};

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [providerSettingsOpen, setProviderSettingsOpen] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [message, setMessage] = useState("");

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
  });

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

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
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [key]: "File must be under 5MB" }));
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setForm(prev => ({ ...prev, [key]: base64 }));
      setErrors(prev => ({ ...prev, [key]: "" }));
    } catch {
      setErrors(prev => ({ ...prev, [key]: "Failed to upload file" }));
    }
  };

  const handleServiceFileChange = async (serviceName: string, docKey: "trade_license" | "skill_certificate", file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [`${serviceName}_${docKey}`]: "File must be under 5MB" }));
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setServices(prev => prev.map(s =>
        s.service === serviceName ? { ...s, [docKey]: base64 } : s
      ));
      setErrors(prev => ({ ...prev, [`${serviceName}_${docKey}`]: "" }));
    } catch {
      setErrors(prev => ({ ...prev, [`${serviceName}_${docKey}`]: "Failed to upload" }));
    }
  };

  const toggleService = (svcName: string) => {
    if (selectedServices.includes(svcName)) {
      setSelectedServices(prev => prev.filter(s => s !== svcName));
      setServices(prev => prev.filter(s => s.service !== svcName));
    } else {
      setSelectedServices(prev => [...prev, svcName]);
      setServices(prev => [...prev, { service: svcName, trade_license: "", skill_certificate: "" }]);
    }
  };

  const handleImageUpdate = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMessage("Image must be under 5MB"); return; }
    setUpdatingImage(true);
    try {
      const base64 = await fileToBase64(file);
      await api.put("/providers/profile", { image: base64 });
      setProfile(prev => prev ? { ...prev, image: base64 } : null);
      setMessage("Profile picture updated!");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Failed to update profile picture.");
    } finally {
      setUpdatingImage(false);
    }
  };

  const handleDeleteProviderProfile = async () => {
    if (!confirm("Are you sure you want to delete your provider profile? You will revert to a regular user.")) return;
    setDeletingProfile(true);
    try {
      await api.delete("/providers/profile");
      setProfile(null);
      setProviderSettingsOpen(false);
      setMessage("Provider profile deleted. You are now a regular user.");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("Failed to delete provider profile.");
    } finally {
      setDeletingProfile(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/providers/profile");
        setProfile(res.data);
        if (res.data) {
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
          });
          const existingServices = res.data.services || [];
          setServices(existingServices);
          setSelectedServices(existingServices.map((s: ServiceItem) => s.service));
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.business_name.trim()) newErrors.business_name = "Business name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.category_id) newErrors.category_id = "Category ID is required";
    if (!form.price.trim()) newErrors.price = "Price is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.sub_city.trim()) newErrors.sub_city = "Sub city is required";
    if (!form.woreda.trim()) newErrors.woreda = "Woreda is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.FAN_number.trim()) newErrors.FAN_number = "FAN number is required";
    if (!form.national_id_photo) newErrors.national_id_photo = "National ID photo is required";
    if (selectedServices.length === 0) newErrors.services = "Please select at least one service";

    // Validate per-service docs
    for (const svc of services) {
      if (!svc.trade_license) {
        newErrors[`${svc.service}_trade_license`] = `Trade license required for ${svc.service}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setMessage("Please fill in all required fields.");
      setTimeout(() => setMessage(""), 4000);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, services };
      if (profile) {
        await api.put("/providers/profile", payload);
        setMessage("Profile updated! Your documents are under review.");
      } else {
        await api.post("/providers/profile", payload);
        setMessage("Provider profile created! Awaiting admin verification.");
      }
      setEditing(false);
      const res = await api.get("/providers/profile");
      setProfile(res.data);
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

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
      case "approved": return "✅"; case "pending": return "⏳";
      case "under_review": return "🔍"; case "rejected": return "❌";
      default: return "❓";
    }
  };

  const inputClass = (key: string) =>
    `w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition ${
      errors[key] ? "border-red-300 bg-red-50 focus:border-red-400"
        : "border-[#dbeafe] bg-[#f5f9ff] focus:border-[#1a6ff0] focus:bg-white"
    }`;

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        {/* Header */}
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
              message.includes("Failed") || message.includes("fill")
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-green-50 border-green-200 text-green-600"
            }`}>{message}</div>
          )}

          {/* Verification Banner */}
          {profile && (
            <div className={`mb-6 rounded-2xl p-5 border flex items-start gap-4 ${
              profile.verification_status === "approved" ? "bg-green-50 border-green-200" :
              profile.verification_status === "rejected" ? "bg-red-50 border-red-200" :
              profile.verification_status === "under_review" ? "bg-purple-50 border-purple-200" :
              "bg-yellow-50 border-yellow-200"
            }`}>
              <span className="text-2xl">{statusIcon(profile.verification_status)}</span>
              <div>
                <p className="font-semibold text-[#0a1f5c] capitalize">Verification: {profile.verification_status?.replace("_", " ")}</p>
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

            {/* Header */}
            <div className="bg-gradient-to-r from-[#0a1f5c] to-[#1a6ff0] px-8 py-10 flex items-center gap-6">
              <div className="relative">
                {profile?.image ? (
                  <img src={profile.image} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white" />
                ) : (
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-[#1a6ff0] shadow-lg">
                    {user?.role[0].toUpperCase()}
                  </div>
                )}
                {profile && (
                  <label className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition">
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpdate(e.target.files?.[0] || null)} />
                    {updatingImage ? <span className="text-xs">⏳</span> : <span className="text-xs">📷</span>}
                  </label>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white text-xl font-bold">{profile?.business_name || "Your Business"}</p>
                <p className="text-blue-200 text-sm capitalize">{user?.role} · ID #{user?.id}</p>
                {profile && (
                  <div className="flex gap-2 mt-2 flex-wrap">
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

            {/* Action Bar */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">
                {profile ? "Provider Profile" : "Become a Provider"}
              </h2>
              <div className="flex items-center gap-3">
                {profile ? (
                  <>
                    <button
                      onClick={() => { setEditing(!editing); setErrors({}); }}
                      className="text-sm bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition cursor-pointer"
                    >
                      {editing ? "Cancel" : "✏️ Edit Profile"}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setProviderSettingsOpen(!providerSettingsOpen)}
                        className="text-sm bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition cursor-pointer flex items-center gap-2"
                      >
                        ⚙️ Provider Settings <span className="text-xs">▼</span>
                      </button>
                      {providerSettingsOpen && (
                        <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 w-56 z-50 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Provider Settings</p>
                          </div>
                          <button
                            onClick={() => { setEditing(true); setProviderSettingsOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-[#eaf2ff] hover:text-[#1a6ff0] transition cursor-pointer"
                          >
                            <span>✏️</span><span>Edit Profile</span>
                          </button>
                          <div className="border-t border-gray-50">
                            <button
                              onClick={handleDeleteProviderProfile}
                              disabled={deletingProfile}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                            >
                              <span>🗑️</span>
                              <div className="text-left">
                                <p className="font-semibold">Delete Provider Profile</p>
                                <p className="text-xs text-red-300">Revert to regular user</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditing(!editing); setErrors({}); }}
                    className="text-sm bg-[#1a6ff0] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#1559c7] transition cursor-pointer"
                  >
                    {editing ? "Cancel" : "➕ Become a Provider"}
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
            ) : !profile && !editing ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <span className="text-5xl mb-4">🔧</span>
                <p className="text-gray-400 font-medium mb-2">No provider profile yet</p>
                <p className="text-gray-300 text-sm mb-6 max-w-md">Create a provider profile and submit your documents for verification.</p>
                <button onClick={() => setEditing(true)} className="bg-[#1a6ff0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
                  Become a Provider
                </button>
              </div>
            ) : editing ? (
              <div className="px-8 py-6">

                {/* Validation Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-red-600 mb-2">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.values(errors).filter(Boolean).map((err, i) => (
                        <li key={i} className="text-xs text-red-500">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-[#eaf2ff] border border-[#dbeafe] rounded-xl p-4 mb-6 flex items-start gap-3">
                  <span className="text-lg">ℹ️</span>
                  <div>
                    <p className="text-sm font-semibold text-[#0a1f5c]">Document Verification Required</p>
                    <p className="text-xs text-gray-500 mt-0.5">Fields marked <span className="text-red-500">*</span> are required. National ID and FAN number are shared. Each service needs its own Trade License.</p>
                  </div>
                </div>

                {/* Basic Info */}
                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { label: "Business Name *", key: "business_name", placeholder: "Abel Plumbing Services" },
                    { label: "Phone Number *", key: "phone", placeholder: "0911234567" },
                    { label: "Category ID *", key: "category_id", placeholder: "1" },
                    { label: "Starting Price (ETB) *", key: "price", placeholder: "500" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setErrors(prev => ({ ...prev, [f.key]: "" })); }}
                        className={inputClass(f.key)}
                      />
                      {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Description</label>
                    <textarea
                      placeholder="Describe your business..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className={inputClass("description") + " resize-none"}
                    />
                  </div>
                </div>

                {/* Location */}
                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { label: "City *", key: "city", placeholder: "Addis Ababa" },
                    { label: "Sub City *", key: "sub_city", placeholder: "Bole" },
                    { label: "Woreda *", key: "woreda", placeholder: "03" },
                    { label: "Sefer / Neighborhood *", key: "location", placeholder: "Friendship area" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setErrors(prev => ({ ...prev, [f.key]: "" })); }}
                        className={inputClass(f.key)}
                      />
                      {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
                    </div>
                  ))}
                </div>

                {/* Shared Identity Documents */}
                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-2">Shared Identity Documents</h3>
                <p className="text-xs text-gray-400 mb-4">These apply to all your services</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">FAN Number (Tax ID) *</label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={form.FAN_number}
                      onChange={e => { setForm({ ...form, FAN_number: e.target.value }); setErrors(prev => ({ ...prev, FAN_number: "" })); }}
                      className={inputClass("FAN_number")}
                    />
                    {errors.FAN_number && <p className="text-xs text-red-500 mt-1">{errors.FAN_number}</p>}
                  </div>

                  {/* Profile Image */}
                  <div>
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Profile Image</label>
                    <div className="border-2 border-dashed border-[#dbeafe] rounded-xl p-4 text-center hover:border-[#1a6ff0] transition bg-[#f5f9ff]">
                      <input type="file" accept="image/*" onChange={e => handleFileChange("image", e.target.files?.[0] || null)} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {form.image ? (
                          <img src={form.image} alt="Preview" className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
                        ) : (
                          <div className="text-3xl mb-2">📷</div>
                        )}
                        <p className="text-xs text-[#1a6ff0] font-semibold">{form.image ? "Change Photo" : "Upload Photo"}</p>
                      </label>
                    </div>
                  </div>

                  {/* National ID */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">National ID Photo *</label>
                    <div className={`border-2 border-dashed rounded-xl p-5 bg-[#f5f9ff] hover:border-[#1a6ff0] transition ${
                      errors.national_id_photo ? "border-red-300 bg-red-50" : form.national_id_photo ? "border-green-400" : "border-[#dbeafe]"
                    }`}>
                      <input type="file" accept="image/*,.pdf" onChange={e => { handleFileChange("national_id_photo", e.target.files?.[0] || null); setErrors(prev => ({ ...prev, national_id_photo: "" })); }} className="hidden" id="national-id-upload" />
                      <label htmlFor="national-id-upload" className="cursor-pointer flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${errors.national_id_photo ? "bg-red-100" : form.national_id_photo ? "bg-green-100" : "bg-[#eaf2ff]"}`}>
                          {form.national_id_photo ? "✅" : "🪪"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0a1f5c]">{form.national_id_photo ? "National ID uploaded ✓" : "Upload National ID"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, PDF · Max 5MB</p>
                        </div>
                        <span className="ml-auto text-xs bg-[#1a6ff0] text-white font-semibold px-3 py-1.5 rounded-lg flex-shrink-0">
                          {form.national_id_photo ? "Change" : "Choose File"}
                        </span>
                      </label>
                    </div>
                    {errors.national_id_photo && <p className="text-xs text-red-500 mt-1">{errors.national_id_photo}</p>}
                  </div>
                </div>

                {/* Service Selection */}
                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-2">Select Your Services *</h3>
                <p className="text-xs text-gray-400 mb-4">Choose all services you can provide. Each requires its own Trade License.</p>
                {errors.services && <p className="text-xs text-red-500 mb-3">{errors.services}</p>}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {ALL_SERVICES.map(svc => (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition cursor-pointer text-left ${
                        selectedServices.includes(svc)
                          ? "border-[#1a6ff0] bg-[#eaf2ff] text-[#1a6ff0]"
                          : "border-gray-200 bg-white text-gray-500 hover:border-[#1a6ff0] hover:bg-[#f5f9ff]"
                      }`}
                    >
                      <span className="text-xl">{serviceIcons[svc]}</span>
                      <span className="text-xs font-semibold">{svc}</span>
                      {selectedServices.includes(svc) && <span className="ml-auto text-xs">✓</span>}
                    </button>
                  ))}
                </div>

                {/* Per-Service Documents */}
                {selectedServices.length > 0 && (
                  <div className="space-y-6 mb-8">
                    <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide">Per-Service Documents</h3>
                    {services.map(svc => (
                      <div key={svc.service} className="border-2 border-[#dbeafe] rounded-2xl p-6 bg-[#f5f9ff]">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 bg-[#1a6ff0] rounded-xl flex items-center justify-center text-xl">
                            {serviceIcons[svc.service]}
                          </div>
                          <div>
                            <p className="font-bold text-[#0a1f5c]">{svc.service}</p>
                            <p className="text-xs text-gray-400">Upload documents for this service</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleService(svc.service)}
                            className="ml-auto text-xs text-red-400 hover:text-red-600 cursor-pointer"
                          >
                            Remove ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Trade License */}
                          <div>
                            <label className="text-xs font-semibold text-[#0a1f5c] mb-2 block uppercase tracking-wide">Trade License *</label>
                            <div className={`border-2 border-dashed rounded-xl p-4 bg-white hover:border-[#1a6ff0] transition ${
                              errors[`${svc.service}_trade_license`] ? "border-red-300" : svc.trade_license ? "border-green-400" : "border-[#dbeafe]"
                            }`}>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={e => handleServiceFileChange(svc.service, "trade_license", e.target.files?.[0] || null)}
                                className="hidden"
                                id={`${svc.service}-trade-license`}
                              />
                              <label htmlFor={`${svc.service}-trade-license`} className="cursor-pointer flex items-center gap-3">
                                <span className="text-2xl">{svc.trade_license ? "✅" : "📄"}</span>
                                <div>
                                  <p className="text-xs font-semibold text-[#0a1f5c]">{svc.trade_license ? "Uploaded ✓" : "Upload Trade License"}</p>
                                  <p className="text-xs text-gray-400">JPG, PNG, PDF</p>
                                </div>
                                <span className="ml-auto text-xs bg-[#1a6ff0] text-white px-2 py-1 rounded-lg flex-shrink-0">
                                  {svc.trade_license ? "Change" : "Choose"}
                                </span>
                              </label>
                            </div>
                            {errors[`${svc.service}_trade_license`] && (
                              <p className="text-xs text-red-500 mt-1">{errors[`${svc.service}_trade_license`]}</p>
                            )}
                          </div>

                          {/* Skill Certificate */}
                          <div>
                            <label className="text-xs font-semibold text-[#0a1f5c] mb-2 block uppercase tracking-wide">Skill Certificate (Optional)</label>
                            <div className={`border-2 border-dashed rounded-xl p-4 bg-white hover:border-[#1a6ff0] transition ${
                              svc.skill_certificate ? "border-green-400" : "border-[#dbeafe]"
                            }`}>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={e => handleServiceFileChange(svc.service, "skill_certificate", e.target.files?.[0] || null)}
                                className="hidden"
                                id={`${svc.service}-skill-cert`}
                              />
                              <label htmlFor={`${svc.service}-skill-cert`} className="cursor-pointer flex items-center gap-3">
                                <span className="text-2xl">{svc.skill_certificate ? "✅" : "🎓"}</span>
                                <div>
                                  <p className="text-xs font-semibold text-[#0a1f5c]">{svc.skill_certificate ? "Uploaded ✓" : "Upload Certificate"}</p>
                                  <p className="text-xs text-gray-400">JPG, PNG, PDF</p>
                                </div>
                                <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg flex-shrink-0">
                                  {svc.skill_certificate ? "Change" : "Choose"}
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#1a6ff0] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#1559c7] transition cursor-pointer disabled:opacity-50 shadow-md shadow-blue-200"
                >
                  {saving ? "Saving..." : profile ? "💾 Update Profile" : "🚀 Submit for Verification"}
                </button>
              </div>
            ) : (
              // View Mode
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

                {/* Services View */}
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Services Offered</h3>
                {profile?.services && profile.services.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                    {profile.services.map((svc, i) => (
                      <div key={i} className="bg-[#eaf2ff] rounded-xl p-4 flex items-center gap-3">
                        <span className="text-2xl">{serviceIcons[svc.service] || "🔨"}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#0a1f5c]">{svc.service}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs ${svc.trade_license ? "text-green-500" : "text-red-400"}`}>
                              {svc.trade_license ? "✅ License" : "❌ License"}
                            </span>
                            <span className={`text-xs ${svc.skill_certificate ? "text-green-500" : "text-gray-400"}`}>
                              {svc.skill_certificate ? "✅ Cert" : "— Cert"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-8">No services added yet.</p>
                )}

                {/* Shared Docs */}
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Shared Documents</h3>
                <div className="space-y-3">
                  {[
                    { label: "National ID Photo", value: profile?.national_id_photo },
                  ].map((f, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${f.value ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex items-center gap-2">
                        <span>{f.value ? "✅" : "❌"}</span>
                        <span className="text-sm font-medium text-[#0a1f5c]">{f.label}</span>
                      </div>
                      {f.value ? <span className="text-xs text-green-600 font-medium">Submitted ✓</span> : <span className="text-xs text-red-400">Not submitted</span>}
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