import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

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
  trade_license: string;
  skill_certificate: string;
  verification_status: "pending" | "under_review" | "approved" | "rejected";
  rejection_reason: string;
  createdAt: string;
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profileDropdown, setProfileDropdown] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchProviders();
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

  const handleVerify = async (id: number, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      await api.put(`/providers/admin/${id}/verify`, {
        verification_status: status,
        rejection_reason: reason || null,
      });
      setProviders(providers.map(p =>
        p.id === id ? { ...p, verification_status: status as ProviderProfile["verification_status"], rejection_reason: reason || "" } : p
      ));
      setMessage(`Provider ${status === "approved" ? "approved" : "rejected"} successfully!`);
      setSelectedProvider(null);
      setRejectionReason("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update verification", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredProviders = providers.filter(p =>
    filter === "all" ? true : p.verification_status === filter
  );

  const stats = [
    { label: "Total Providers", value: providers.length, icon: "👥", color: "bg-blue-50 text-[#1a6ff0]" },
    { label: "Pending Review", value: providers.filter(p => p.verification_status === "pending").length, icon: "⏳", color: "bg-yellow-50 text-yellow-500" },
    { label: "Under Review", value: providers.filter(p => p.verification_status === "under_review").length, icon: "🔍", color: "bg-purple-50 text-purple-500" },
    { label: "Approved", value: providers.filter(p => p.verification_status === "approved").length, icon: "✅", color: "bg-green-50 text-green-500" },
    { label: "Rejected", value: providers.filter(p => p.verification_status === "rejected").length, icon: "❌", color: "bg-red-50 text-red-400" },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-600";
      case "pending": return "bg-yellow-100 text-yellow-600";
      case "under_review": return "bg-purple-100 text-purple-600";
      case "rejected": return "bg-red-100 text-red-400";
      default: return "bg-gray-100 text-gray-500";
    }
  };

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
          <button onClick={() => navigate("/dashboard")} className="text-sm text-blue-200 hover:text-white transition cursor-pointer">
            User Dashboard
          </button>
          <div className="relative">
            <button onClick={() => setProfileDropdown(!profileDropdown)} className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
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

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0a1f5c]">Provider Verification</h1>
          <p className="text-gray-400 text-sm mt-1">Review and approve provider applications</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl">
            ✅ {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => setFilter(s.label === "Total Providers" ? "all" : s.label.toLowerCase().replace(" ", "_"))}>
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-lg mb-3 ${s.color}`}>{s.icon}</div>
              <p className="text-2xl font-bold text-[#0a1f5c]">{s.value}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {["all", "pending", "under_review", "approved", "rejected"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer capitalize ${
                filter === f ? "bg-[#1a6ff0] text-white" : "bg-white text-gray-500 hover:bg-[#eaf2ff]"
              }`}
            >
              {f.replace("_", " ")}
              <span className="ml-2 text-xs opacity-70">
                ({f === "all" ? providers.length : providers.filter(p => p.verification_status === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Providers Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0a1f5c]">Provider Applications</h2>
              <p className="text-gray-400 text-sm">{filteredProviders.length} providers</p>
            </div>
            <button onClick={fetchProviders} className="text-xs bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition cursor-pointer">
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
          ) : filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-4">📋</span>
              <p className="text-gray-400 font-medium">No providers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f9ff]">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Provider</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Documents</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">FAN</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Applied</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProviders.map(p => (
                    <tr key={p.id} className="hover:bg-[#f5f9ff] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#dbeafe] rounded-xl flex items-center justify-center text-sm font-bold text-[#1a6ff0] flex-shrink-0">
                            {p.business_name?.[0] || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0a1f5c]">{p.business_name}</p>
                            <p className="text-xs text-gray-400">{p.phone}</p>
                            <p className="text-xs text-gray-400">User #{p.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{p.city}</p>
                        <p className="text-xs text-gray-400">{p.sub_city}, Woreda {p.woreda}</p>
                        <p className="text-xs text-gray-400">{p.location}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className={`flex items-center gap-1 text-xs ${p.national_id_photo ? "text-green-500" : "text-red-400"}`}>
                            <span>{p.national_id_photo ? "✅" : "❌"}</span>
                            <span>National ID</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${p.trade_license ? "text-green-500" : "text-red-400"}`}>
                            <span>{p.trade_license ? "✅" : "❌"}</span>
                            <span>Trade License</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${p.skill_certificate ? "text-green-500" : "text-red-400"}`}>
                            <span>{p.skill_certificate ? "✅" : "❌"}</span>
                            <span>Skill Certificate</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.FAN_number || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor(p.verification_status)}`}>
                          {p.verification_status?.replace("_", " ")}
                        </span>
                        {p.verification_status === "rejected" && p.rejection_reason && (
                          <p className="text-xs text-red-400 mt-1 max-w-32 truncate">{p.rejection_reason}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedProvider(p)}
                            className="text-xs bg-[#eaf2ff] text-[#1a6ff0] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#dbeafe] transition cursor-pointer"
                          >
                            Review
                          </button>
                          {p.verification_status !== "approved" && (
                            <button
                              onClick={() => handleVerify(p.id, "approved")}
                              disabled={actionLoading}
                              className="text-xs bg-green-100 text-green-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-green-200 transition cursor-pointer disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {p.verification_status !== "rejected" && (
                            <button
                              onClick={() => { setSelectedProvider(p); setRejectionReason(""); }}
                              className="text-xs bg-red-100 text-red-400 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-200 transition cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0a1f5c] to-[#1a6ff0] px-8 py-6 rounded-t-3xl flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-xl">{selectedProvider.business_name}</h2>
                <p className="text-blue-200 text-sm">Provider Review</p>
              </div>
              <button onClick={() => setSelectedProvider(null)} className="text-white hover:text-blue-200 text-xl cursor-pointer">✕</button>
            </div>

            <div className="p-8">

              {/* Provider Details */}
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
                ].map((f, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{f.label}</p>
                    <p className="text-sm font-medium text-[#0a1f5c]">{f.value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {selectedProvider.description && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-gray-600 bg-[#f5f9ff] rounded-xl p-4">{selectedProvider.description}</p>
                </div>
              )}

              {/* Documents */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Submitted Documents</p>
                <div className="space-y-3">
                  {[
                    { label: "National ID Photo", value: selectedProvider.national_id_photo },
                    { label: "Trade License", value: selectedProvider.trade_license },
                    { label: "Skill Certificate", value: selectedProvider.skill_certificate },
                  ].map((doc, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${doc.value ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex items-center gap-2">
                        <span>{doc.value ? "✅" : "❌"}</span>
                        <span className="text-sm font-medium text-[#0a1f5c]">{doc.label}</span>
                      </div>
                      {doc.value ? (
                        <a href={doc.value} target="_blank" rel="noreferrer" className="text-xs text-[#1a6ff0] font-semibold hover:underline cursor-pointer">
                          View Document →
                        </a>
                      ) : (
                        <span className="text-xs text-red-400 font-medium">Not submitted</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Status */}
              <div className="mb-6 flex items-center gap-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Current Status:</p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor(selectedProvider.verification_status)}`}>
                  {selectedProvider.verification_status?.replace("_", " ")}
                </span>
              </div>

              {/* Rejection Reason */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                  Rejection Reason (required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Explain why this provider is being rejected..."
                  rows={3}
                  className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify(selectedProvider.id, "under_review")}
                  disabled={actionLoading}
                  className="flex-1 bg-purple-100 text-purple-600 font-semibold py-3 rounded-xl hover:bg-purple-200 transition cursor-pointer disabled:opacity-50"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => handleVerify(selectedProvider.id, "approved")}
                  disabled={actionLoading}
                  className="flex-1 bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition cursor-pointer disabled:opacity-50"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      alert("Please provide a rejection reason");
                      return;
                    }
                    handleVerify(selectedProvider.id, "rejected", rejectionReason);
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition cursor-pointer disabled:opacity-50"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;