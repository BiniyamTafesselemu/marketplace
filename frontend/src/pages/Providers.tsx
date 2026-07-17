import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface ProviderProfile {
  id: number;
  business_name: string;
  phone: string;
  city: string;
  sub_city: string;
  woreda: string;
  location: string;
  image: string;
  user_id: number;
}

interface ServiceCard {
  id: number;
  service: string;
  price: string;
  description: string;
  payment_method: string;
  payment_account: string;
  status: string;
  provider_id: number;
  ProviderProfile: ProviderProfile;
}

const serviceIcons: Record<string, string> = {
  "Plumbing": "🔧", "Electrical": "⚡", "Cleaning": "🧹",
  "Painting": "🎨", "Carpentry": "🪚", "AC Repair": "❄️",
  "Auto Service": "🚗", "Electronics": "📱", "Masonry": "🧱",
  "Welding": "🔥", "Tiling": "🪟", "Landscaping": "🌿",
  "Moving": "📦", "Security": "🔒", "IT Support": "💻"
};

const paymentIcons: Record<string, string> = {
  "Telebirr": "📱", "CBE Birr": "🏦", "Amole": "💳",
  "HelloCash": "💵", "Cash": "💰", "Bank Transfer": "🏛️"
};

const ALL_SERVICES = Object.keys(serviceIcons).sort();
const PAYMENT_METHODS = ["Telebirr", "CBE Birr", "Amole", "HelloCash", "Cash", "Bank Transfer"];

function Providers() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSubCity, setSelectedSubCity] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isProvider, setIsProvider] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/services");
        // Show all services that have a valid ProviderProfile
        const validServices = res.data.filter(
          (s: ServiceCard) => s.ProviderProfile !== null && s.ProviderProfile !== undefined
        );
        setServices(validServices);

        if (isAuthenticated) {
          try {
            const profileRes = await api.get("/providers/profile");
            if (profileRes.data) setIsProvider(true);
          } catch { setIsProvider(false); }
        }
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cities = [...new Set(services.map(s => s.ProviderProfile?.city).filter(Boolean))].sort() as string[];
  const subCities = [...new Set(
    services
      .filter(s => !selectedCity || s.ProviderProfile?.city === selectedCity)
      .map(s => s.ProviderProfile?.sub_city)
      .filter(Boolean)
  )].sort() as string[];

  const availableServices = [...new Set(services.map(s => s.service).filter(Boolean))].sort() as string[];

  const searchSuggestions = ALL_SERVICES.filter(svc =>
    svc.toLowerCase().includes(search.toLowerCase()) && search.length > 0
  );

  const filteredServices = services
    .filter(s => {
      if (!s.ProviderProfile) return false;

      const matchesSearch = search
        ? s.service?.toLowerCase().includes(search.toLowerCase()) ||
          s.ProviderProfile?.business_name?.toLowerCase().includes(search.toLowerCase()) ||
          s.description?.toLowerCase().includes(search.toLowerCase()) ||
          s.ProviderProfile?.city?.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesService = selectedService ? s.service === selectedService : true;
      const matchesCity = selectedCity ? s.ProviderProfile?.city === selectedCity : true;
      const matchesSubCity = selectedSubCity ? s.ProviderProfile?.sub_city === selectedSubCity : true;
      const matchesPayment = selectedPayment ? s.payment_method === selectedPayment : true;
      return matchesSearch && matchesService && matchesCity && matchesSubCity && matchesPayment;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price_desc") return Number(b.price) - Number(a.price);
      return b.id - a.id;
    });

  const uniqueProviders = new Set(services.map(s => s.provider_id)).size;

  const clearAllFilters = () => {
    setSearch("");
    setSelectedService("");
    setSelectedCity("");
    setSelectedSubCity("");
    setSelectedPayment("");
    setSearchDropdownOpen(false);
  };

  const hasActiveFilters = !!(search || selectedService || selectedCity || selectedSubCity || selectedPayment);

  return (
    <div className="min-h-screen bg-[#f5f9ff]">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-xl">🔧</span>
          <span className="font-bold text-[#0a1f5c] text-lg">ServiceHub</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate("/dashboard")} className="text-sm text-gray-500 hover:text-[#1a6ff0] transition cursor-pointer">Dashboard</button>
              {isProvider ? (
                <button onClick={() => navigate("/dashboard/profile")} className="text-sm font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition cursor-pointer">
                  ✏️ Edit Provider Profile
                </button>
              ) : (
                <button onClick={() => navigate("/dashboard/profile")} className="text-sm font-semibold bg-[#1a6ff0] hover:bg-[#1559c7] text-white px-4 py-2 rounded-full transition cursor-pointer">
                  🔧 Become a Provider
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-[#1a6ff0] transition cursor-pointer">Login</button>
              <button onClick={() => navigate("/signup")} className="text-sm font-semibold bg-[#1a6ff0] text-white px-4 py-2 rounded-full hover:bg-[#1559c7] transition cursor-pointer">Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a1f5c] to-[#1a6ff0] px-8 py-16 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">Find a Service</h1>
        <p className="text-blue-100 mb-8">Browse verified services across Addis Ababa and beyond</p>

        <div className="max-w-3xl mx-auto flex gap-3 flex-wrap justify-center">
          <div ref={searchRef} className="flex-1 min-w-64 relative">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-md">
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by service, provider, or location..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSearchDropdownOpen(true); setSelectedService(""); }}
                onFocus={() => setSearchDropdownOpen(true)}
                className="flex-1 text-sm text-gray-600 outline-none placeholder-gray-300"
              />
              {search && (
                <button onClick={() => { setSearch(""); setSearchDropdownOpen(false); }} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none">×</button>
              )}
              <button onClick={() => setSearchDropdownOpen(!searchDropdownOpen)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs">
                {searchDropdownOpen ? "▲" : "▼"}
              </button>
            </div>

            {/* Search Dropdown */}
            {searchDropdownOpen && (
              <div className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-80 overflow-y-auto">

                {/* Matching suggestions when typing */}
                {search && searchSuggestions.length > 0 && (
                  <div className="border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2">Matching Services</p>
                    {searchSuggestions.map(svc => (
                      <button
                        key={`suggestion-${svc}`}
                        onClick={() => { setSearch(svc); setSelectedService(svc); setSearchDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#eaf2ff] transition cursor-pointer text-left"
                      >
                        <span className="text-xl">{serviceIcons[svc]}</span>
                        <span className="text-sm font-medium text-[#0a1f5c]">{svc}</span>
                        <span className="ml-auto text-xs text-gray-400">
                          {services.filter(s => s.service === svc).length} available
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* All available services from DB alphabetically */}
                {availableServices.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2">
                      {search ? "All Service Types" : "Browse by Service"}
                    </p>
                    {availableServices.map(svc => (
                      <button
                        key={`available-${svc}`}
                        onClick={() => { setSearch(svc); setSelectedService(svc); setSearchDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#eaf2ff] transition cursor-pointer text-left ${selectedService === svc ? "bg-[#eaf2ff]" : ""}`}
                      >
                        <span className="text-xl">{serviceIcons[svc] || "🔨"}</span>
                        <span className="text-sm font-medium text-[#0a1f5c]">{svc}</span>
                        <span className="ml-auto text-xs bg-[#eaf2ff] text-[#1a6ff0] px-2 py-0.5 rounded-full font-semibold">
                          {services.filter(s => s.service === svc).length}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-400">No services available yet</p>
                  </div>
                )}

                {/* Search all option */}
                {search && (
                  <div className="border-t border-gray-50">
                    <button
                      onClick={() => { setSelectedService(""); setSearchDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#eaf2ff] transition cursor-pointer text-left"
                    >
                      <span className="text-xl">🔍</span>
                      <span className="text-sm font-medium text-[#1a6ff0]">Search all results for "{search}"</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <select
            value={selectedCity}
            onChange={e => { setSelectedCity(e.target.value); setSelectedSubCity(""); }}
            className="bg-white rounded-xl px-4 py-3 text-sm text-gray-600 outline-none shadow-md cursor-pointer"
          >
            <option value="">All Cities</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-10">
          {[
            { value: services.length, label: "Services" },
            { value: uniqueProviders, label: "Providers" },
            { value: availableServices.length, label: "Service Types" },
            { value: cities.length, label: "Cities" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-blue-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="px-8 lg:px-16 py-8">

        {/* Join Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-[#eaf2ff] to-[#dbeafe] rounded-2xl p-6 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-[#0a1f5c] font-bold text-lg mb-1">Are you a service provider?</p>
              <p className="text-gray-500 text-sm">Join ServiceHub and reach thousands of customers in your area</p>
            </div>
            <button onClick={() => navigate("/signup")} className="bg-[#1a6ff0] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1559c7] transition cursor-pointer flex-shrink-0">
              Join as Provider →
            </button>
          </div>
        )}

        {/* Service Type Pills */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Browse by Service Type</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => { setSelectedService(""); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${!selectedService && !search ? "bg-[#1a6ff0] text-white" : "bg-white text-gray-500 hover:bg-[#eaf2ff]"}`}
            >
              All Services
              <span className="text-xs opacity-70">({services.length})</span>
            </button>
            {availableServices.map(svc => (
              <button
                key={`pill-${svc}`}
                onClick={() => { setSelectedService(svc); setSearch(svc); setSearchDropdownOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${selectedService === svc ? "bg-[#1a6ff0] text-white" : "bg-white text-gray-500 hover:bg-[#eaf2ff]"}`}
              >
                <span>{serviceIcons[svc] || "🔨"}</span>
                {svc}
                <span className="text-xs opacity-70">({services.filter(s => s.service === svc).length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Advanced Filters</h2>
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-36">
              <label className="text-xs text-gray-400 mb-1 block">Sub City</label>
              <select value={selectedSubCity} onChange={e => setSelectedSubCity(e.target.value)} className="w-full border border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer">
                <option value="">All Sub Cities</option>
                {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-36">
              <label className="text-xs text-gray-400 mb-1 block">Payment Method</label>
              <select value={selectedPayment} onChange={e => setSelectedPayment(e.target.value)} className="w-full border border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer">
                <option value="">All Payment Methods</option>
                {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-36">
              <label className="text-xs text-gray-400 mb-1 block">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full border border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer">
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-xs text-red-400 hover:text-red-600 font-semibold cursor-pointer border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition">
                Clear All ×
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex gap-2 flex-wrap mb-6">
            {selectedService && (
              <span className="flex items-center gap-1 text-xs bg-[#1a6ff0] text-white px-3 py-1 rounded-full font-semibold">
                {serviceIcons[selectedService] || "🔨"} {selectedService}
                <button onClick={() => { setSelectedService(""); setSearch(""); }} className="ml-1 hover:opacity-70 cursor-pointer">×</button>
              </span>
            )}
            {selectedCity && (
              <span className="flex items-center gap-1 text-xs bg-[#0a1f5c] text-white px-3 py-1 rounded-full font-semibold">
                📍 {selectedCity}
                <button onClick={() => { setSelectedCity(""); setSelectedSubCity(""); }} className="ml-1 hover:opacity-70 cursor-pointer">×</button>
              </span>
            )}
            {selectedSubCity && (
              <span className="flex items-center gap-1 text-xs bg-gray-600 text-white px-3 py-1 rounded-full font-semibold">
                🏘 {selectedSubCity}
                <button onClick={() => setSelectedSubCity("")} className="ml-1 hover:opacity-70 cursor-pointer">×</button>
              </span>
            )}
            {selectedPayment && (
              <span className="flex items-center gap-1 text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-semibold">
                💳 {selectedPayment}
                <button onClick={() => setSelectedPayment("")} className="ml-1 hover:opacity-70 cursor-pointer">×</button>
              </span>
            )}
            {search && !selectedService && (
              <span className="flex items-center gap-1 text-xs bg-gray-500 text-white px-3 py-1 rounded-full font-semibold">
                🔍 "{search}"
                <button onClick={() => setSearch("")} className="ml-1 hover:opacity-70 cursor-pointer">×</button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            Showing <span className="font-semibold text-[#0a1f5c]">{filteredServices.length}</span> services
            {selectedService && ` · ${selectedService}`}
            {selectedCity && ` · ${selectedCity}`}
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <p className="text-gray-400 font-medium text-lg mb-2">No services found</p>
            <p className="text-gray-300 text-sm mb-6">Try adjusting your search or filters</p>
            <button onClick={clearAllFilters} className="bg-[#1a6ff0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(svc => {
              const provider = svc.ProviderProfile;
              return (
                <div key={svc.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden">

                  {/* Service Banner */}
                  <div className="bg-gradient-to-r from-[#eaf2ff] to-[#dbeafe] px-6 py-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                      {serviceIcons[svc.service] || "🔨"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a6ff0] text-base">{svc.service}</p>
                      <p className="text-xs text-gray-500 font-medium truncate">{provider?.business_name}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                      svc.status === "approved" ? "bg-green-100 text-green-600" :
                      svc.status === "pending" ? "bg-yellow-100 text-yellow-600" :
                      "bg-red-100 text-red-400"
                    }`}>
                      {svc.status === "approved" ? "Active" : svc.status === "pending" ? "Pending" : "Rejected"}
                    </span>
                  </div>

                  {/* Provider Info */}
                  <div className="px-6 pt-4 pb-2 flex items-center gap-3 border-b border-gray-50">
                    {provider?.image ? (
                      <img src={provider.image} alt={provider.business_name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 bg-[#dbeafe] rounded-full flex items-center justify-center text-sm font-bold text-[#1a6ff0] flex-shrink-0">
                        {provider?.business_name?.[0] || "P"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0a1f5c] truncate">{provider?.business_name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {[provider?.city, provider?.sub_city, provider?.woreda ? `Woreda ${provider.woreda}` : null].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                      <span className="text-xs text-gray-400 ml-1">New</span>
                    </div>

                    {svc.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{svc.description}</p>
                    )}

                    <div className="space-y-1.5 mb-4">
                      {provider?.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>📞</span><span>{provider.phone}</span>
                        </div>
                      )}
                      {provider?.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>🏘️</span><span>{provider.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <span>{paymentIcons[svc.payment_method] || "💳"}</span>
                        <span>{svc.payment_method}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-400">{svc.payment_account}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      {provider?.city && <span className="text-xs bg-[#eaf2ff] text-[#1a6ff0] px-2 py-0.5 rounded-full">{provider.city}</span>}
                      {provider?.sub_city && <span className="text-xs bg-[#eaf2ff] text-[#1a6ff0] px-2 py-0.5 rounded-full">{provider.sub_city}</span>}
                      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{svc.payment_method}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400">Starting from</p>
                        <p className="text-xl font-bold text-[#1a6ff0]">ETB {svc.price}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/providers/${svc.provider_id}`)}
                        className="bg-[#1a6ff0] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-8 lg:px-20 py-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔧</span>
          <span className="font-bold text-[#0a1f5c]">ServiceHub</span>
        </div>
        <p className="text-gray-400 text-sm">© 2026 ServiceHub. All rights reserved.</p>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-[#1a6ff0]">Privacy</a>
          <a href="#" className="hover:text-[#1a6ff0]">Terms</a>
          <a href="#" className="hover:text-[#1a6ff0]">Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default Providers;