import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Provider {
  id: number;
  business_name: string;
  phone: string;
  description: string;
  city: string;
  sub_city: string;
  woreda: string;
  location: string;
  price: string;
  category_id: number;
  user_id: number;
  image: string;
  FAN_number: string;
  national_id_photo: string;
}

interface Category {
  id: number;
  name: string;
}

function Providers() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedWoreda, setSelectedWoreda] = useState("");
  const [selectedSubCity, setSelectedSubCity] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providersRes, categoriesRes] = await Promise.all([
          api.get("/providers"),
          api.get("/categories"),
        ]);
        setProviders(providersRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cities = [...new Set(providers.map(p => p.city).filter(Boolean))];
  const subCities = [...new Set(providers.filter(p => !selectedCity || p.city === selectedCity).map(p => p.sub_city).filter(Boolean))];
  const woredas = [...new Set(providers.filter(p => !selectedSubCity || p.sub_city === selectedSubCity).map(p => p.woreda).filter(Boolean))];

  const filteredProviders = providers
    .filter(p => {
      const matchesSearch =
        p.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
      const matchesCity = selectedCity ? p.city === selectedCity : true;
      const matchesSubCity = selectedSubCity ? p.sub_city === selectedSubCity : true;
      const matchesWoreda = selectedWoreda ? p.woreda === selectedWoreda : true;
      return matchesSearch && matchesCategory && matchesCity && matchesSubCity && matchesWoreda;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price_desc") return Number(b.price) - Number(a.price);
      return b.id - a.id;
    });

  const categoryIcons: Record<number, string> = {
    1: "🔧", 2: "⚡", 3: "🧹", 4: "🎨", 5: "🪟", 6: "❄️", 7: "🚗", 8: "📱",
  };

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
              <button onClick={() => navigate("/dashboard")} className="text-sm text-gray-500 hover:text-[#1a6ff0] transition cursor-pointer">
                Dashboard
              </button>
              <button onClick={() => navigate("/dashboard/profile")} className="text-sm font-semibold bg-[#1a6ff0] text-white px-4 py-2 rounded-full hover:bg-[#1559c7] transition cursor-pointer">
                Become a Provider
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-[#1a6ff0] transition cursor-pointer">
                Login
              </button>
              <button onClick={() => navigate("/signup")} className="text-sm font-semibold bg-[#1a6ff0] text-white px-4 py-2 rounded-full hover:bg-[#1559c7] transition cursor-pointer">
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Search */}
      <section className="bg-gradient-to-br from-[#0a1f5c] to-[#1a6ff0] px-8 py-16 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">Find a Service Provider</h1>
        <p className="text-blue-100 mb-8">Browse verified professionals across Addis Ababa and beyond</p>

        <div className="max-w-3xl mx-auto flex gap-3 flex-wrap justify-center">
          <div className="flex-1 min-w-64 flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-md">
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name, service, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-600 outline-none placeholder-gray-300"
            />
          </div>
          <select
            value={selectedCity}
            onChange={e => { setSelectedCity(e.target.value); setSelectedSubCity(""); setSelectedWoreda(""); }}
            className="bg-white rounded-xl px-4 py-3 text-sm text-gray-600 outline-none shadow-md cursor-pointer"
          >
            <option value="">All Cities</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-10">
          {[
            { value: providers.length, label: "Providers" },
            { value: categories.length, label: "Categories" },
            { value: cities.length, label: "Cities" },
            { value: "4.8★", label: "Avg Rating" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-blue-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="px-8 lg:px-16 py-8">

        {/* Become a Provider Banner */}
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

        {/* Category Filter */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Filter by Category</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                selectedCategory === null ? "bg-[#1a6ff0] text-white" : "bg-white text-gray-500 hover:bg-[#eaf2ff]"
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  selectedCategory === cat.id ? "bg-[#1a6ff0] text-white" : "bg-white text-gray-500 hover:bg-[#eaf2ff]"
                }`}
              >
                <span>{categoryIcons[cat.id] || "🔨"}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Location Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Filter by Location</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-40">
              <label className="text-xs text-gray-400 mb-1 block">Sub City</label>
              <select
                value={selectedSubCity}
                onChange={e => { setSelectedSubCity(e.target.value); setSelectedWoreda(""); }}
                className="w-full border border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer"
              >
                <option value="">All Sub Cities</option>
                {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-40">
              <label className="text-xs text-gray-400 mb-1 block">Woreda</label>
              <select
                value={selectedWoreda}
                onChange={e => setSelectedWoreda(e.target.value)}
                className="w-full border border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer"
              >
                <option value="">All Woredas</option>
                {woredas.map(w => <option key={w} value={w}>Woreda {w}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-40">
              <label className="text-xs text-gray-400 mb-1 block">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full border border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            {(selectedCategory || selectedCity || selectedSubCity || selectedWoreda || search) && (
              <div className="flex items-end">
                <button
                  onClick={() => { setSearch(""); setSelectedCategory(null); setSelectedCity(""); setSelectedSubCity(""); setSelectedWoreda(""); }}
                  className="text-xs text-red-400 hover:text-red-600 font-semibold cursor-pointer border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            Showing <span className="font-semibold text-[#0a1f5c]">{filteredProviders.length}</span> providers
            {search && ` for "${search}"`}
          </p>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <p className="text-gray-400 font-medium text-lg mb-2">No providers found</p>
            <p className="text-gray-300 text-sm mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory(null); setSelectedCity(""); setSelectedSubCity(""); setSelectedWoreda(""); }}
              className="bg-[#1a6ff0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map(p => {
              const category = categories.find(c => c.id === p.category_id);
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden group">

                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-[#eaf2ff] to-[#dbeafe] px-6 py-5 flex items-center gap-4">
                    {p.image ? (
                      <img src={p.image} alt={p.business_name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                        {categoryIcons[p.category_id] || "🔨"}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-[#0a1f5c]">{p.business_name}</p>
                      <p className="text-xs text-[#1a6ff0] font-medium">{category?.name || "Service Provider"}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-5">

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">New Provider</span>
                    </div>

                    {/* Description */}
                    {p.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{p.description}</p>
                    )}

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>📍</span>
                        <span>
                          {[p.city, p.sub_city, p.woreda ? `Woreda ${p.woreda}` : null, p.location]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                      {p.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>📞</span>
                          <span>{p.phone}</span>
                        </div>
                      )}
                      {p.FAN_number && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>🪪</span>
                          <span>FAN: {p.FAN_number}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {p.city && <span className="text-xs bg-[#eaf2ff] text-[#1a6ff0] px-2 py-0.5 rounded-full">{p.city}</span>}
                      {p.sub_city && <span className="text-xs bg-[#eaf2ff] text-[#1a6ff0] px-2 py-0.5 rounded-full">{p.sub_city}</span>}
                      {category && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">{category.name}</span>}
                    </div>

                    {/* Price & Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400">Starting from</p>
                        <p className="text-lg font-bold text-[#1a6ff0]">ETB {p.price || "—"}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/providers/${p.id}`)}
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