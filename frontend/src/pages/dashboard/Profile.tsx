import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface ServiceItem {
  id: number;
  service: string;
  price: string;
  description: string;
  trade_license: string;
  skill_certificate: string;
  payment_method: string;
  payment_account: string;
  status: string;
  rejection_reason: string;
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

const PAYMENT_METHODS = ["Telebirr", "CBE Birr", "Amole", "HelloCash", "Cash", "Bank Transfer"];

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

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [myServices, setMyServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [addingService, setAddingService] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
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

  const [serviceForm, setServiceForm] = useState({
    service: "",
    price: "",
    description: "",
    trade_license: "",
    skill_certificate: "",
    payment_method: "",
    payment_account: "",
  });

  const [serviceErrors, setServiceErrors] = useState<FormErrors>({});

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (key: string, file: File | null, isServiceForm = false) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      if (isServiceForm) setServiceErrors(prev => ({ ...prev, [key]: "File must be under 5MB" }));
      else setErrors(prev => ({ ...prev, [key]: "File must be under 5MB" }));
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      if (isServiceForm) {
        setServiceForm(prev => ({ ...prev, [key]: base64 }));
        setServiceErrors(prev => ({ ...prev, [key]: "" }));
      } else {
        setForm(prev => ({ ...prev, [key]: base64 }));
        setErrors(prev => ({ ...prev, [key]: "" }));
      }
    } catch {
      if (isServiceForm) setServiceErrors(prev => ({ ...prev, [key]: "Failed to upload" }));
      else setErrors(prev => ({ ...prev, [key]: "Failed to upload" }));
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
      setMyServices([]);
      setProviderSettingsOpen(false);
      setMessage("Provider profile deleted.");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("Failed to delete provider profile.");
    } finally {
      setDeletingProfile(false);
    }
  };

  const fetchMyServices = async () => {
    try {
      const res = await api.get("/services/my");
      setMyServices(res.data);
    } catch {
      setMyServices([]);
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
          await fetchMyServices();
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateServiceForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!serviceForm.service) newErrors.service = "Service type is required";
    if (!serviceForm.price.trim()) newErrors.price = "Price is required";
    if (!serviceForm.payment_method) newErrors.payment_method = "Payment method is required";
    if (!serviceForm.payment_account.trim()) newErrors.payment_account = "Payment account is required";
    if (!serviceForm.trade_license) newErrors.trade_license = "Trade license is required";
    setServiceErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) { setMessage("Please fill in all required fields."); setTimeout(() => setMessage(""), 4000); return; }
    setSaving(true);
    try {
      if (profile) {
        await api.put("/providers/profile", form);
        setMessage("Profile updated! Under review.");
      } else {
        await api.post("/providers/profile", form);
        setMessage("Provider profile created! Awaiting verification.");
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

  const handleSaveService = async () => {
    if (!validateServiceForm()) { setMessage("Please fill in all service fields."); setTimeout(() => setMessage(""), 4000); return; }
    setSaving(true);
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, serviceForm);
        setMessage("Service updated! Under review.");
      } else {
        await api.post("/services", serviceForm);
        setMessage("Service added! Awaiting admin approval.");
      }
      setAddingService(false);
      setEditingService(null);
      setServiceForm({ service: "", price: "", description: "", trade_license: "", skill_certificate: "", payment_method: "", payment_account: "" });
      setServiceErrors({});
      await fetchMyServices();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      await fetchMyServices();
      setMessage("Service deleted.");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Failed to delete service.");
    }
  };

  const handleEditService = (svc: ServiceItem) => {
    setEditingService(svc);
    setServiceForm({
      service: svc.service,
      price: svc.price,
      description: svc.description || "",
      trade_license: svc.trade_license || "",
      skill_certificate: svc.skill_certificate || "",
      payment_method: svc.payment_method,
      payment_account: svc.payment_account,
    });
    setAddingService(true);
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const inputClass = (key: string, isService = false) => {
    const errs = isService ? serviceErrors : errors;
    return `w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition ${
      errs[key] ? "border-red-300 bg-red-50 focus:border-red-400" : "border-[#dbeafe] bg-[#f5f9ff] focus:border-[#1a6ff0] focus:bg-white"
    }`;
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-[#0a1f5c]">My Profile</h1>
            <p className="text-xs text-gray-400">Manage your provider profile and services</p>
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
              message.includes("Failed") || message.includes("fill") ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"
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
                {profile.verification_status === "under_review" && <p className="text-sm text-purple-600 mt-1">An admin is reviewing your documents.</p>}
                {profile.verification_status === "approved" && <p className="text-sm text-green-600 mt-1">Your profile is approved! Add services below to appear in search results.</p>}
                {profile.verification_status === "rejected" && (
                  <div>
                    <p className="text-sm text-red-500 mt-1">Your profile was rejected.</p>
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
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">

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
                      profile.account_status === "suspended" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"
                    }`}>{profile.account_status}</span>
                    <span className="inline-block text-xs px-3 py-0.5 rounded-full font-semibold bg-blue-100 text-[#1a6ff0]">
                      {myServices.length} Services
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">{profile ? "Provider Profile" : "Become a Provider"}</h2>
              <div className="flex items-center gap-3">
                {profile ? (
                  <>
                    <button onClick={() => { setEditing(!editing); setErrors({}); }} className="text-sm bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition cursor-pointer">
                      {editing ? "Cancel" : "✏️ Edit Profile"}
                    </button>
                    <div className="relative">
                      <button onClick={() => setProviderSettingsOpen(!providerSettingsOpen)} className="text-sm bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition cursor-pointer flex items-center gap-2">
                        ⚙️ Settings <span className="text-xs">▼</span>
                      </button>
                      {providerSettingsOpen && (
                        <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 w-56 z-50 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Provider Settings</p>
                          </div>
                          <button onClick={() => { setEditing(true); setProviderSettingsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-[#eaf2ff] hover:text-[#1a6ff0] transition cursor-pointer">
                            <span>✏️</span><span>Edit Profile</span>
                          </button>
                          <div className="border-t border-gray-50">
                            <button onClick={handleDeleteProviderProfile} disabled={deletingProfile} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer disabled:opacity-50">
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
                  <button onClick={() => { setEditing(!editing); setErrors({}); }} className="text-sm bg-[#1a6ff0] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
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
                <p className="text-gray-300 text-sm mb-6 max-w-md">Create a provider profile and add your services for customers to find you.</p>
                <button onClick={() => setEditing(true)} className="bg-[#1a6ff0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
                  Become a Provider
                </button>
              </div>
            ) : editing ? (
              <div className="px-8 py-6">

                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-red-600 mb-2">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.values(errors).filter(Boolean).map((err, i) => <li key={i} className="text-xs text-red-500">{err}</li>)}
                    </ul>
                  </div>
                )}

                <div className="bg-[#eaf2ff] border border-[#dbeafe] rounded-xl p-4 mb-6 flex items-start gap-3">
                  <span className="text-lg">ℹ️</span>
                  <div>
                    <p className="text-sm font-semibold text-[#0a1f5c]">Provider Profile Setup</p>
                    <p className="text-xs text-gray-500 mt-0.5">Fill in your business info. After approval, add individual services with payment details.</p>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { label: "Business Name *", key: "business_name", placeholder: "Abel Services" },
                    { label: "Phone Number *", key: "phone", placeholder: "0911234567" },
                    { label: "Category ID *", key: "category_id", placeholder: "1" },
                    { label: "Default Price (ETB) *", key: "price", placeholder: "500" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">{f.label}</label>
                      <input type="text" placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setErrors(prev => ({ ...prev, [f.key]: "" })); }} className={inputClass(f.key)} />
                      {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Description</label>
                    <textarea placeholder="Describe your business..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass("description") + " resize-none"} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { label: "City *", key: "city", placeholder: "Addis Ababa" },
                    { label: "Sub City *", key: "sub_city", placeholder: "Bole" },
                    { label: "Woreda *", key: "woreda", placeholder: "03" },
                    { label: "Sefer *", key: "location", placeholder: "Friendship area" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">{f.label}</label>
                      <input type="text" placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setErrors(prev => ({ ...prev, [f.key]: "" })); }} className={inputClass(f.key)} />
                      {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Identity Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">FAN Number *</label>
                    <input type="text" placeholder="1234567890" value={form.FAN_number} onChange={e => { setForm({ ...form, FAN_number: e.target.value }); setErrors(prev => ({ ...prev, FAN_number: "" })); }} className={inputClass("FAN_number")} />
                    {errors.FAN_number && <p className="text-xs text-red-500 mt-1">{errors.FAN_number}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Profile Image</label>
                    <div className="border-2 border-dashed border-[#dbeafe] rounded-xl p-4 text-center bg-[#f5f9ff]">
                      <input type="file" accept="image/*" onChange={e => handleFileChange("image", e.target.files?.[0] || null)} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {form.image ? <img src={form.image} alt="Preview" className="w-14 h-14 rounded-full object-cover mx-auto mb-2" /> : <div className="text-3xl mb-2">📷</div>}
                        <p className="text-xs text-[#1a6ff0] font-semibold">{form.image ? "Change" : "Upload Photo"}</p>
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">National ID Photo *</label>
                    <div className={`border-2 border-dashed rounded-xl p-5 bg-[#f5f9ff] hover:border-[#1a6ff0] transition ${errors.national_id_photo ? "border-red-300 bg-red-50" : form.national_id_photo ? "border-green-400" : "border-[#dbeafe]"}`}>
                      <input type="file" accept="image/*,.pdf" onChange={e => { handleFileChange("national_id_photo", e.target.files?.[0] || null); setErrors(prev => ({ ...prev, national_id_photo: "" })); }} className="hidden" id="national-id-upload" />
                      <label htmlFor="national-id-upload" className="cursor-pointer flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${errors.national_id_photo ? "bg-red-100" : form.national_id_photo ? "bg-green-100" : "bg-[#eaf2ff]"}`}>
                          {form.national_id_photo ? "✅" : "🪪"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0a1f5c]">{form.national_id_photo ? "National ID uploaded ✓" : "Upload National ID"}</p>
                          <p className="text-xs text-gray-400">JPG, PNG, PDF · Max 5MB</p>
                        </div>
                        <span className="ml-auto text-xs bg-[#1a6ff0] text-white font-semibold px-3 py-1.5 rounded-lg flex-shrink-0">{form.national_id_photo ? "Change" : "Choose File"}</span>
                      </label>
                    </div>
                    {errors.national_id_photo && <p className="text-xs text-red-500 mt-1">{errors.national_id_photo}</p>}
                  </div>
                </div>

                <button onClick={handleSaveProfile} disabled={saving} className="bg-[#1a6ff0] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#1559c7] transition cursor-pointer disabled:opacity-50 shadow-md shadow-blue-200">
                  {saving ? "Saving..." : profile ? "💾 Update Profile" : "🚀 Submit for Verification"}
                </button>
              </div>
            ) : (
              // View Mode
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {[
                    { label: "Business Name", value: profile?.business_name },
                    { label: "Phone", value: profile?.phone },
                    { label: "City", value: profile?.city },
                    { label: "Sub City", value: profile?.sub_city },
                    { label: "Woreda", value: profile?.woreda },
                    { label: "Location", value: profile?.location },
                  ].map((f, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{f.label}</p>
                      <p className="text-sm font-medium text-[#0a1f5c]">{f.value || "—"}</p>
                    </div>
                  ))}
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl border ${profile?.national_id_photo ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-center gap-2">
                    <span>{profile?.national_id_photo ? "✅" : "❌"}</span>
                    <span className="text-sm font-medium text-[#0a1f5c]">National ID Photo</span>
                  </div>
                  <span className={`text-xs font-medium ${profile?.national_id_photo ? "text-green-600" : "text-red-400"}`}>
                    {profile?.national_id_photo ? "Submitted ✓" : "Not submitted"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Services Section */}
          {profile && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0a1f5c]">My Services</h2>
                  <p className="text-gray-400 text-sm">Each service requires its own documents and payment method</p>
                </div>
                {!addingService && (
                  <button
                    onClick={() => { setAddingService(true); setEditingService(null); setServiceForm({ service: "", price: "", description: "", trade_license: "", skill_certificate: "", payment_method: "", payment_account: "" }); setServiceErrors({}); }}
                    className="bg-[#1a6ff0] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1559c7] transition cursor-pointer"
                  >
                    + Add Service
                  </button>
                )}
              </div>

              {/* Add/Edit Service Form */}
              {addingService && (
                <div className="px-8 py-6 border-b border-gray-50 bg-[#f5f9ff]">
                  <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">
                    {editingService ? `Edit ${editingService.service}` : "Add New Service"}
                  </h3>

                  {Object.keys(serviceErrors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                      <ul className="list-disc list-inside space-y-1">
                        {Object.values(serviceErrors).filter(Boolean).map((err, i) => <li key={i} className="text-xs text-red-500">{err}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    {/* Service Type */}
                    <div>
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Service Type *</label>
                      <select
                        value={serviceForm.service}
                        onChange={e => { setServiceForm(prev => ({ ...prev, service: e.target.value })); setServiceErrors(prev => ({ ...prev, service: "" })); }}
                        className={inputClass("service", true)}
                        disabled={!!editingService}
                      >
                        <option value="">Select a service...</option>
                        {ALL_SERVICES.map(s => <option key={s} value={s}>{serviceIcons[s]} {s}</option>)}
                      </select>
                      {serviceErrors.service && <p className="text-xs text-red-500 mt-1">{serviceErrors.service}</p>}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Price (ETB) *</label>
                      <input type="text" placeholder="500" value={serviceForm.price} onChange={e => { setServiceForm(prev => ({ ...prev, price: e.target.value })); setServiceErrors(prev => ({ ...prev, price: "" })); }} className={inputClass("price", true)} />
                      {serviceErrors.price && <p className="text-xs text-red-500 mt-1">{serviceErrors.price}</p>}
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Payment Method *</label>
                      <select value={serviceForm.payment_method} onChange={e => { setServiceForm(prev => ({ ...prev, payment_method: e.target.value })); setServiceErrors(prev => ({ ...prev, payment_method: "" })); }} className={inputClass("payment_method", true)}>
                        <option value="">Select payment method...</option>
                        {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {serviceErrors.payment_method && <p className="text-xs text-red-500 mt-1">{serviceErrors.payment_method}</p>}
                    </div>

                    {/* Payment Account */}
                    <div>
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">
                        Payment Account * <span className="text-gray-400 normal-case font-normal">(phone or account number)</span>
                      </label>
                      <input type="text" placeholder="0911234567" value={serviceForm.payment_account} onChange={e => { setServiceForm(prev => ({ ...prev, payment_account: e.target.value })); setServiceErrors(prev => ({ ...prev, payment_account: "" })); }} className={inputClass("payment_account", true)} />
                      {serviceErrors.payment_account && <p className="text-xs text-red-500 mt-1">{serviceErrors.payment_account}</p>}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Service Description</label>
                      <textarea placeholder="Describe this specific service..." value={serviceForm.description} onChange={e => setServiceForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className={inputClass("description", true) + " resize-none"} />
                    </div>

                    {/* Trade License */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Trade License for this Service *</label>
                      <div className={`border-2 border-dashed rounded-xl p-5 bg-white hover:border-[#1a6ff0] transition ${serviceErrors.trade_license ? "border-red-300 bg-red-50" : serviceForm.trade_license ? "border-green-400" : "border-[#dbeafe]"}`}>
                        <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange("trade_license", e.target.files?.[0] || null, true)} className="hidden" id="service-trade-license" />
                        <label htmlFor="service-trade-license" className="cursor-pointer flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${serviceErrors.trade_license ? "bg-red-100" : serviceForm.trade_license ? "bg-green-100" : "bg-[#eaf2ff]"}`}>
                            {serviceForm.trade_license ? "✅" : "📄"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0a1f5c]">{serviceForm.trade_license ? "Trade License uploaded ✓" : "Upload Trade License"}</p>
                            <p className="text-xs text-gray-400">JPG, PNG, PDF · Max 5MB</p>
                          </div>
                          <span className="ml-auto text-xs bg-[#1a6ff0] text-white font-semibold px-3 py-1.5 rounded-lg flex-shrink-0">{serviceForm.trade_license ? "Change" : "Choose File"}</span>
                        </label>
                      </div>
                      {serviceErrors.trade_license && <p className="text-xs text-red-500 mt-1">{serviceErrors.trade_license}</p>}
                    </div>

                    {/* Skill Certificate */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Skill Certificate (Optional)</label>
                      <div className={`border-2 border-dashed rounded-xl p-5 bg-white hover:border-[#1a6ff0] transition ${serviceForm.skill_certificate ? "border-green-400" : "border-[#dbeafe]"}`}>
                        <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange("skill_certificate", e.target.files?.[0] || null, true)} className="hidden" id="service-skill-cert" />
                        <label htmlFor="service-skill-cert" className="cursor-pointer flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${serviceForm.skill_certificate ? "bg-green-100" : "bg-[#eaf2ff]"}`}>
                            {serviceForm.skill_certificate ? "✅" : "🎓"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0a1f5c]">{serviceForm.skill_certificate ? "Certificate uploaded ✓" : "Upload Skill Certificate"}</p>
                            <p className="text-xs text-gray-400">JPG, PNG, PDF · Max 5MB</p>
                          </div>
                          <span className="ml-auto text-xs bg-gray-100 text-gray-600 font-semibold px-3 py-1.5 rounded-lg flex-shrink-0">{serviceForm.skill_certificate ? "Change" : "Choose File"}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleSaveService} disabled={saving} className="bg-[#1a6ff0] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1559c7] transition cursor-pointer disabled:opacity-50">
                      {saving ? "Saving..." : editingService ? "💾 Update Service" : "➕ Add Service"}
                    </button>
                    <button onClick={() => { setAddingService(false); setEditingService(null); setServiceErrors({}); }} className="bg-gray-100 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Services List */}
              {myServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl mb-3">🔨</span>
                  <p className="text-gray-400 font-medium mb-1">No services added yet</p>
                  <p className="text-gray-300 text-sm mb-4">Add your first service to appear in customer searches</p>
                  {!addingService && (
                    <button onClick={() => { setAddingService(true); setEditingService(null); }} className="text-sm text-[#1a6ff0] font-semibold hover:underline cursor-pointer">
                      + Add your first service
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {myServices.map(svc => (
                    <div key={svc.id} className="px-8 py-5 hover:bg-[#f5f9ff] transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#eaf2ff] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {serviceIcons[svc.service] || "🔨"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-[#0a1f5c]">{svc.service}</p>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor(svc.status)}`}>
                                {svc.status}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-[#1a6ff0]">ETB {svc.price}</p>
                            {svc.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{svc.description}</p>}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-500">
                                {svc.payment_method} · {svc.payment_account}
                              </span>
                              <span className={`text-xs ${svc.trade_license ? "text-green-500" : "text-red-400"}`}>
                                {svc.trade_license ? "✅ License" : "❌ License"}
                              </span>
                              <span className={`text-xs ${svc.skill_certificate ? "text-green-500" : "text-gray-400"}`}>
                                {svc.skill_certificate ? "✅ Cert" : "— Cert"}
                              </span>
                            </div>
                            {svc.status === "rejected" && svc.rejection_reason && (
                              <p className="text-xs text-red-400 mt-1">Reason: {svc.rejection_reason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button onClick={() => handleEditService(svc)} className="text-xs bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#dbeafe] transition cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteService(svc.id)} className="text-xs bg-red-50 text-red-400 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </div>
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

export default Profile;