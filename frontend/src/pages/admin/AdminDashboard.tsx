import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface ServiceItem {
  id: number;
  service: string;
  price: string;
  description: string;
  payment_method: string;
  payment_account: string;
  status: string;
  rejection_reason: string;
  provider_id: number;
  createdAt: string;
  ProviderProfile: {
    id: number;
    business_name: string;
    city: string;
    user_id: number;
  };
}

interface ProviderProfile {
  id: number;
  user_id: number;
  business_name: string;
  phone: string;
  description: string;
  city: string;
  sub_city: string;
  woreda: string;
  location: string;
  price: string;
  category_id: number;
  FAN_number: string;
  national_id_photo: string;
  services: any[];
  image: string;
  verification_status: "pending" | "under_review" | "approved" | "rejected";
  rejection_reason: string;
  account_status: "active" | "suspended" | "banned";
  suspension_reason: string;
  createdAt: string;
}

const serviceIcons: Record<string, string> = {
  "Plumbing": "🔧", "Electrical": "⚡", "Cleaning": "🧹",
  "Painting": "🎨", "Carpentry": "🪚", "AC Repair": "❄️",
  "Auto Service": "🚗", "Electronics": "📱", "Masonry": "🧱",
  "Welding": "🔥", "Tiling": "🪟", "Landscaping": "🌿",
  "Moving": "📦", "Security": "🔒", "IT Support": "💻"
};

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState<"providers" | "services">("providers");
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [serviceRejectionReason, setServiceRejectionReason] = useState("");
  const [filter, setFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "documents" | "actions">("details");
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/dashboard"); return; }
    fetchProviders();
    fetchAllServices();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await api.get("/providers/admin/all");
      setProviders(res.data);
    } catch (error) {
      console.error("Failed to fetch providers", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllServices = async () => {
    try {
      const res = await api.get("/services/admin/all");
      setAllServices(res.data);
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleVerify = async (id: number, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      await api.put(`/providers/admin/${id}/verify`, { verification_status: status, rejection_reason: reason || null });
      setProviders(providers.map(p => p.id === id ? { ...p, verification_status: status as any, rejection_reason: reason || "" } : p));
      setMessage(`Provider ${status} successfully!`);
      setSelectedProvider(null);
      setRejectionReason("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccountStatus = async (id: number, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      await api.put(`/providers/admin/${id}/account-status`, { account_status: status, suspension_reason: reason || null });
      setProviders(providers.map(p => p.id === id ? { ...p, account_status: status as any, suspension_reason: reason || "" } : p));
      setMessage(`Provider account ${status} successfully!`);
      setSelectedProvider(null);
      setSuspensionReason("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleServiceStatus = async (id: number, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      await api.put(`/services/admin/${id}/status`, { status, rejection_reason: reason || null });
      setAllServices(allServices.map(s => s.id === id ? { ...s, status, rejection_reason: reason || "" } : s));
      setMessage(`Service ${status} successfully!`);
      setServiceRejectionReason("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const filteredProviders = providers.filter(p => {
    const matchesVerification = filter === "all" ? true : p.verification_status === filter;
    const matchesAccount = accountFilter === "all" ? true : p.account_status === accountFilter;
    return matchesVerification && matchesAccount;
  });

  const filteredServices = allServices.filter(s =>
    serviceFilter === "all" ? true : s.status === serviceFilter
  );

  const verificationStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-600";
      case "pending": return "bg-yellow-100 text-yellow-600";
      case "under_review": return "bg-purple-100 text-purple-600";
      case "rejected": return "bg-red-100 text-red-400";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const accountStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-600";
      case "suspended": return "bg-orange-100 text-orange-600";
      case "banned": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const serviceStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-600";
      case "pending": return "bg-yellow-100 text-yellow-600";
      case "rejected": return "bg-red-100 text-red-400";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const renderDocPreview = (value: string, label: string) => {
    if (!value) return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-red-200 bg-red-50">
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span className="text-sm text-red-500">{label} — Not submitted</span>
        </div>
      </div>
    );
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-green-200">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span className="text-sm font-semibold text-[#0a1f5c]">{label}</span>
          </div>
        </div>
        {value.startsWith("data:image") ? (
          <img src={value} alt={label} className="w-full max-h-48 object-contain bg-white p-2" />
        ) : value.startsWith("data:application/pdf") ? (
          <div className="flex items-center gap-3 p-4 bg-white">
            <span className="text-3xl">📄</span>
            <div>
              <p className="text-sm font-medium text-[#0a1f5c]">PDF Document</p>
              <a href={value} download={`${label}.pdf`} className="text-xs text-[#1a6ff0] hover:underline cursor-pointer">Download PDF →</a>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white">
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-[#1a6ff0] hover:underline">View Document →</a>
          </div>
        )}
      </div>
    );
  };

  const getDocumentCompleteness = (p: ProviderProfile) => {
    const services = Array.isArray(p.services) ? p.services : [];
    const totalDocs = 1 + (services.length * 2);
    const submittedDocs =
      (p.national_id_photo ? 1 : 0) +
      services.reduce((acc: number, s: any) => acc + (s.trade_license ? 1 : 0) + (s.skill_certificate ? 1 : 0), 0);
    return { total: totalDocs, submitted: submittedDocs };
  };

  const providerStats = [
    { label: "Total", value: providers.length, icon: "👥", color: "bg-blue-50 text-[#1a6ff0]", filter: "all" },
    { label: "Pending", value: providers.filter(p => p.verification_status === "pending").length, icon: "⏳", color: "bg-yellow-50 text-yellow-500", filter: "pending" },
    { label: "Under Review", value: providers.filter(p => p.verification_status === "under_review").length, icon: "🔍", color: "bg-purple-50 text-purple-500", filter: "under_review" },
    { label: "Approved", value: providers.filter(p => p.verification_status === "approved").length, icon: "✅", color: "bg-green-50 text-green-500", filter: "approved" },
    { label: "Rejected", value: providers.filter(p => p.verification_status === "rejected").length, icon: "❌", color: "bg-red-50 text-red-400", filter: "rejected" },
    { label: "Suspended", value: providers.filter(p => p.account_status === "suspended").length, icon: "⚠️", color: "bg-orange-50 text-orange-500", filter: "suspended" },
    { label: "Banned", value: providers.filter(p => p.account_status === "banned").length, icon: "🚫", color: "bg-red-50 text-red-600", filter: "banned" },
  ];

  const serviceStats = [
    { label: "Total", value: allServices.length, icon: "🔨", color: "bg-blue-50 text-[#1a6ff0]", filter: "all" },
    { label: "Pending", value: allServices.filter(s => s.status === "pending").length, icon: "⏳", color: "bg-yellow-50 text-yellow-500", filter: "pending" },
    { label: "Approved", value: allServices.filter(s => s.status === "approved").length, icon: "✅", color: "bg-green-50 text-green-500", filter: "approved" },
    { label: "Rejected", value: allServices.filter(s => s.status === "rejected").length, icon: "❌", color: "bg-red-50 text-red-400", filter: "rejected" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f9ff]">

      {/* Navbar */}
      <header className="bg-[#0a1f5c] px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔧</span>
          <span className="font-bold text-white text-lg">ServiceHub</span>
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-sm text-blue-200 hover:text-white transition cursor-pointer">User Dashboard</button>
          <div className="relative">
            <button onClick={() => setProfileDropdown(!profileDropdown)} className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
              <span className="text-white text-sm font-medium hidden md:block">Admin</span>
              <span className="text-blue-200 text-xs">▼</span>
            </button>
            {profileDropdown && (
              <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 w-48 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-semibold text-[#0a1f5c]">Admin</p>
                  <p className="text-xs text-gray-400">ID #{user?.id}</p>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-50 transition cursor-pointer">
                  <span>🚪</span><span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-8 lg:px-16 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0a1f5c]">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage providers and their services</p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl">
            ✅ {message}
          </div>
        )}

        {/* Main Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveMainTab("providers")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition cursor-pointer ${activeMainTab === "providers" ? "bg-[#1a6ff0] text-white shadow-md" : "bg-white text-gray-500 hover:bg-[#eaf2ff]"}`}
          >
            👥 Providers
            {providers.filter(p => p.verification_status === "pending").length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {providers.filter(p => p.verification_status === "pending").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveMainTab("services")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition cursor-pointer ${activeMainTab === "services" ? "bg-[#1a6ff0] text-white shadow-md" : "bg-white text-gray-500 hover:bg-[#eaf2ff]"}`}
          >
            🔨 Services
            {allServices.filter(s => s.status === "pending").length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {allServices.filter(s => s.status === "pending").length}
              </span>
            )}
          </button>
        </div>

        {/* ==================== PROVIDERS TAB ==================== */}
        {activeMainTab === "providers" && (
          <>
            {/* Provider Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
              {providerStats.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => setFilter(s.filter)}>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-base mb-2 ${s.color}`}>{s.icon}</div>
                  <p className="text-xl font-bold text-[#0a1f5c]">{s.value}</p>
                  <p className="text-gray-400 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Provider Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-start">
              <div>
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Verification</p>
                <div className="flex gap-2 flex-wrap">
                  {["all", "pending", "under_review", "approved", "rejected"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer capitalize ${filter === f ? "bg-[#1a6ff0] text-white" : "bg-[#eaf2ff] text-gray-500 hover:bg-[#dbeafe]"}`}>
                      {f.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-l border-gray-100 pl-4">
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Account</p>
                <div className="flex gap-2">
                  {["all", "active", "suspended", "banned"].map(f => (
                    <button key={f} onClick={() => setAccountFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer capitalize ${accountFilter === f ? "bg-[#0a1f5c] text-white" : "bg-[#eaf2ff] text-gray-500 hover:bg-[#dbeafe]"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={fetchProviders} className="ml-auto text-xs bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition cursor-pointer self-end">
                🔄 Refresh
              </button>
            </div>

            {/* Providers Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-lg font-bold text-[#0a1f5c]">Provider Applications</h2>
                <p className="text-gray-400 text-sm">{filteredProviders.length} providers</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
              ) : filteredProviders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <span className="text-5xl mb-4">📋</span>
                  <p className="text-gray-400">No providers found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f5f9ff]">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Provider</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Docs</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Verification</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProviders.map(p => {
                        const docs = getDocumentCompleteness(p);
                        return (
                          <tr key={p.id} className="hover:bg-[#f5f9ff] transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {p.image ? (
                                  <img src={p.image} alt={p.business_name} className="w-10 h-10 rounded-xl object-cover" />
                                ) : (
                                  <div className="w-10 h-10 bg-[#dbeafe] rounded-xl flex items-center justify-center text-sm font-bold text-[#1a6ff0]">
                                    {p.business_name?.[0] || "P"}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-[#0a1f5c]">{p.business_name}</p>
                                  <p className="text-xs text-gray-400">{p.phone}</p>
                                  <p className="text-xs text-gray-300">User #{p.user_id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">{p.city}</p>
                              <p className="text-xs text-gray-400">{p.sub_city}, Woreda {p.woreda}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                docs.submitted === docs.total ? "bg-green-100 text-green-600" :
                                docs.submitted === 0 ? "bg-red-100 text-red-400" : "bg-yellow-100 text-yellow-600"
                              }`}>
                                {docs.submitted}/{docs.total} docs
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize ${verificationStatusColor(p.verification_status)}`}>
                                {p.verification_status?.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize ${accountStatusColor(p.account_status)}`}>
                                {p.account_status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => { setSelectedProvider(p); setActiveTab("details"); setRejectionReason(""); setSuspensionReason(""); setExpandedService(null); }}
                                className="text-xs bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#dbeafe] transition cursor-pointer"
                              >
                                Manage →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================== SERVICES TAB ==================== */}
        {activeMainTab === "services" && (
          <>
            {/* Service Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {serviceStats.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => setServiceFilter(s.filter)}>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-base mb-2 ${s.color}`}>{s.icon}</div>
                  <p className="text-xl font-bold text-[#0a1f5c]">{s.value}</p>
                  <p className="text-gray-400 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Service Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "approved", "rejected"].map(f => (
                  <button key={f} onClick={() => setServiceFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer capitalize ${serviceFilter === f ? "bg-[#1a6ff0] text-white" : "bg-[#eaf2ff] text-gray-500 hover:bg-[#dbeafe]"}`}>
                    {f}
                    <span className="ml-1 opacity-70">
                      ({f === "all" ? allServices.length : allServices.filter(s => s.status === f).length})
                    </span>
                  </button>
                ))}
              </div>
              <button onClick={fetchAllServices} className="ml-auto text-xs bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition cursor-pointer">
                🔄 Refresh
              </button>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-lg font-bold text-[#0a1f5c]">Service Applications</h2>
                <p className="text-gray-400 text-sm">{filteredServices.length} services</p>
              </div>

              {servicesLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
              ) : filteredServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <span className="text-5xl mb-4">🔨</span>
                  <p className="text-gray-400">No services found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredServices.map(svc => (
                    <div key={svc.id} className="px-6 py-5 hover:bg-[#f5f9ff] transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#eaf2ff] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {serviceIcons[svc.service] || "🔨"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-[#0a1f5c]">{svc.service}</p>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${serviceStatusColor(svc.status)}`}>
                                {svc.status}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-[#1a6ff0]">ETB {svc.price}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              By: <span className="font-medium text-[#0a1f5c]">{svc.ProviderProfile?.business_name}</span>
                              {svc.ProviderProfile?.city && ` · ${svc.ProviderProfile.city}`}
                            </p>
                            {svc.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{svc.description}</p>}
                            <p className="text-xs text-gray-400 mt-0.5">
                              Payment: {svc.payment_method} · {svc.payment_account}
                            </p>
                            {svc.status === "rejected" && svc.rejection_reason && (
                              <p className="text-xs text-red-400 mt-1">Reason: {svc.rejection_reason}</p>
                            )}
                            <p className="text-xs text-gray-300 mt-1">{new Date(svc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Service Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {svc.status !== "approved" && (
                            <button
                              onClick={() => handleServiceStatus(svc.id, "approved")}
                              disabled={actionLoading}
                              className="text-xs bg-green-100 text-green-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-green-200 transition cursor-pointer disabled:opacity-50"
                            >
                              ✅ Approve
                            </button>
                          )}
                          {svc.status !== "rejected" && (
                            <div className="flex flex-col gap-1">
                              <input
                                type="text"
                                placeholder="Rejection reason..."
                                value={serviceRejectionReason}
                                onChange={e => setServiceRejectionReason(e.target.value)}
                                className="text-xs border border-red-200 rounded-lg px-2 py-1 outline-none focus:border-red-400 w-40"
                              />
                              <button
                                onClick={() => {
                                  if (!serviceRejectionReason.trim()) { alert("Please provide a rejection reason"); return; }
                                  handleServiceStatus(svc.id, "rejected", serviceRejectionReason);
                                }}
                                disabled={actionLoading}
                                className="text-xs bg-red-100 text-red-500 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-200 transition cursor-pointer disabled:opacity-50"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                          {svc.status === "approved" && (
                            <button
                              onClick={() => handleServiceStatus(svc.id, "pending")}
                              disabled={actionLoading}
                              className="text-xs bg-yellow-100 text-yellow-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition cursor-pointer disabled:opacity-50"
                            >
                              ⏳ Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Provider Management Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#0a1f5c] to-[#1a6ff0] px-8 py-6 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {selectedProvider.image ? (
                  <img src={selectedProvider.image} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-white" />
                ) : (
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl font-bold text-[#1a6ff0]">
                    {selectedProvider.business_name?.[0]}
                  </div>
                )}
                <div>
                  <h2 className="text-white font-bold text-lg">{selectedProvider.business_name}</h2>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${verificationStatusColor(selectedProvider.verification_status)}`}>
                      {selectedProvider.verification_status?.replace("_", " ")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${accountStatusColor(selectedProvider.account_status)}`}>
                      {selectedProvider.account_status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedProvider(null)} className="text-white hover:text-blue-200 text-xl cursor-pointer">✕</button>
            </div>

            <div className="flex border-b border-gray-100 px-8 sticky top-[88px] bg-white z-10">
              {(["details", "documents", "actions"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 px-4 text-sm font-semibold capitalize transition cursor-pointer border-b-2 ${activeTab === tab ? "border-[#1a6ff0] text-[#1a6ff0]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === "details" && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: "Business Name", value: selectedProvider.business_name },
                      { label: "Phone", value: selectedProvider.phone },
                      { label: "City", value: selectedProvider.city },
                      { label: "Sub City", value: selectedProvider.sub_city },
                      { label: "Woreda", value: selectedProvider.woreda },
                      { label: "Location", value: selectedProvider.location },
                      { label: "Price", value: `ETB ${selectedProvider.price}` },
                      { label: "FAN Number", value: selectedProvider.FAN_number },
                      { label: "User ID", value: `#${selectedProvider.user_id}` },
                      { label: "Applied", value: new Date(selectedProvider.createdAt).toLocaleDateString() },
                    ].map((f, i) => (
                      <div key={i}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{f.label}</p>
                        <p className="text-sm font-medium text-[#0a1f5c]">{f.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                  {selectedProvider.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-600">{selectedProvider.rejection_reason}</p>
                    </div>
                  )}
                  {selectedProvider.suspension_reason && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-1">Suspension Reason</p>
                      <p className="text-sm text-orange-600">{selectedProvider.suspension_reason}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-3">Shared Documents</h3>
                  {renderDocPreview(selectedProvider.national_id_photo, "National ID Photo")}
                  <div className="p-4 bg-[#f5f9ff] rounded-xl border border-[#dbeafe]">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">FAN Number</p>
                    <p className="text-sm font-medium text-[#0a1f5c]">{selectedProvider.FAN_number || "—"}</p>
                  </div>

                  {Array.isArray(selectedProvider.services) && selectedProvider.services.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-3">Per-Service Documents</h3>
                      {selectedProvider.services.map((svc: any, i: number) => (
                        <div key={i} className="border-2 border-[#dbeafe] rounded-2xl overflow-hidden mb-4">
                          <button
                            onClick={() => setExpandedService(expandedService === svc.service ? null : svc.service)}
                            className="w-full flex items-center justify-between px-5 py-4 bg-[#f5f9ff] hover:bg-[#eaf2ff] transition cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{serviceIcons[svc.service] || "🔨"}</span>
                              <span className="font-semibold text-[#0a1f5c]">{svc.service}</span>
                            </div>
                            <span className="text-gray-400 text-sm">{expandedService === svc.service ? "▲" : "▼"}</span>
                          </button>
                          {expandedService === svc.service && (
                            <div className="p-5 space-y-4">
                              {renderDocPreview(svc.trade_license, `${svc.service} — Trade License`)}
                              {svc.skill_certificate
                                ? renderDocPreview(svc.skill_certificate, `${svc.service} — Skill Certificate`)
                                : <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-400">— Skill Certificate not submitted (optional)</div>
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "actions" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Verification Actions</h3>
                    <div className="space-y-3">
                      <button onClick={() => handleVerify(selectedProvider.id, "under_review")} disabled={actionLoading || selectedProvider.verification_status === "under_review"} className="w-full flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition cursor-pointer disabled:opacity-50">
                        <span className="text-xl">🔍</span>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-purple-700">Mark as Under Review</p>
                          <p className="text-xs text-purple-500">Start reviewing this provider's documents</p>
                        </div>
                      </button>
                      <button onClick={() => handleVerify(selectedProvider.id, "approved")} disabled={actionLoading || selectedProvider.verification_status === "approved"} className="w-full flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition cursor-pointer disabled:opacity-50">
                        <span className="text-xl">✅</span>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-green-700">Approve Provider</p>
                          <p className="text-xs text-green-500">Provider will be visible to customers</p>
                        </div>
                      </button>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl">❌</span>
                          <div>
                            <p className="text-sm font-semibold text-red-700">Reject Provider</p>
                            <p className="text-xs text-red-500">Provider must resubmit documents</p>
                          </div>
                        </div>
                        <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Enter rejection reason (required)..." rows={2} className="w-full border border-red-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none mb-3" />
                        <button onClick={() => { if (!rejectionReason.trim()) { alert("Please provide a rejection reason"); return; } handleVerify(selectedProvider.id, "rejected", rejectionReason); }} disabled={actionLoading} className="w-full bg-red-500 text-white font-semibold py-2 rounded-xl hover:bg-red-600 transition cursor-pointer disabled:opacity-50">
                          Reject Provider
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0a1f5c] uppercase tracking-wide mb-4">Account Status Actions</h3>
                    <div className="space-y-3">
                      <button onClick={() => handleAccountStatus(selectedProvider.id, "active")} disabled={actionLoading || selectedProvider.account_status === "active"} className="w-full flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition cursor-pointer disabled:opacity-50">
                        <span className="text-xl">🟢</span>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-green-700">Activate Account</p>
                          <p className="text-xs text-green-500">Restore full access</p>
                        </div>
                      </button>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl">⚠️</span>
                          <div>
                            <p className="text-sm font-semibold text-orange-700">Suspend Account</p>
                            <p className="text-xs text-orange-500">Temporarily hide from customers</p>
                          </div>
                        </div>
                        <textarea value={suspensionReason} onChange={e => setSuspensionReason(e.target.value)} placeholder="Enter suspension reason..." rows={2} className="w-full border border-orange-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none mb-3" />
                        <button onClick={() => handleAccountStatus(selectedProvider.id, "suspended", suspensionReason)} disabled={actionLoading || selectedProvider.account_status === "suspended"} className="w-full bg-orange-500 text-white font-semibold py-2 rounded-xl hover:bg-orange-600 transition cursor-pointer disabled:opacity-50">
                          Suspend Provider
                        </button>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl">🚫</span>
                          <div>
                            <p className="text-sm font-semibold text-red-700">Ban Account</p>
                            <p className="text-xs text-red-500">Permanently ban from platform</p>
                          </div>
                        </div>
                        <button onClick={() => { if (!confirm("Permanently ban this provider?")) return; handleAccountStatus(selectedProvider.id, "banned", "Banned by admin"); }} disabled={actionLoading || selectedProvider.account_status === "banned"} className="w-full bg-red-600 text-white font-semibold py-2 rounded-xl hover:bg-red-700 transition cursor-pointer disabled:opacity-50">
                          Ban Provider
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;