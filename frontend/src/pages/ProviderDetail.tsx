import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

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
  image: string;
  user_id: number;
}

interface ServiceItem {
  id: number;
  service: string;
  price: string;
  description: string;
  payment_method: string;
  payment_account: string;
  status: string;
  provider_id: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  customer_id: number;
  provider_id: number;
  booking_id: number;
  createdAt: string;
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

function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providersRes, servicesRes, reviewsRes] = await Promise.all([
          api.get("/providers"),
          api.get("/services"),
          api.get(`/reviews/provider/${id}`)
        ]);

        const found = providersRes.data.find((p: ProviderProfile) => p.id === Number(id));
        if (found) setProvider(found);

        const providerServices = servicesRes.data.filter(
          (s: ServiceItem) => s.provider_id === Number(id) && s.status === "approved"
        );
        setServices(providerServices);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error("Failed to fetch provider data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!selectedService) { setBookingError("Please select a service"); return; }
    if (!bookingDate) { setBookingError("Please select a date"); return; }

    setBookingLoading(true);
    setBookingError("");
    try {
      await api.post("/bookings", { provider_id: Number(id), date: bookingDate });
      setBookingSuccess(true);
      setTimeout(() => navigate("/dashboard/bookings"), 2000);
    } catch (err: any) {
      setBookingError(err?.response?.data?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <p className="text-gray-400 font-medium mb-4">Provider not found</p>
          <button onClick={() => navigate("/providers")} className="bg-[#1a6ff0] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1559c7] transition cursor-pointer">
            Browse Providers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f9ff]">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-xl">🔧</span>
          <span className="font-bold text-[#0a1f5c] text-lg">ServiceHub</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/providers")} className="text-sm text-gray-500 hover:text-[#1a6ff0] transition cursor-pointer">
            ← Back to Services
          </button>
          {isAuthenticated ? (
            <button onClick={() => navigate("/dashboard")} className="text-sm font-semibold bg-[#1a6ff0] text-white px-4 py-2 rounded-full hover:bg-[#1559c7] transition cursor-pointer">
              Dashboard
            </button>
          ) : (
            <button onClick={() => navigate("/login")} className="text-sm font-semibold bg-[#1a6ff0] text-white px-4 py-2 rounded-full hover:bg-[#1559c7] transition cursor-pointer">
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#0a1f5c] to-[#1a6ff0] px-8 py-12">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          {provider.image ? (
            <img src={provider.image} alt={provider.business_name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
          ) : (
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-4xl font-bold text-[#1a6ff0] shadow-xl">
              {provider.business_name?.[0]}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-1">{provider.business_name}</h1>
            <p className="text-blue-200 text-sm mb-3">
              📍 {[provider.city, provider.sub_city, provider.woreda ? `Woreda ${provider.woreda}` : null, provider.location].filter(Boolean).join(", ")}
            </p>
            <div className="flex gap-3 flex-wrap">
              <span className="text-xs bg-green-400 text-white px-3 py-1 rounded-full font-semibold">✅ Verified</span>
              {avgRating ? (
                <span className="text-xs bg-yellow-400 text-white px-3 py-1 rounded-full font-semibold">
                  ★ {avgRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              ) : (
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">No reviews yet</span>
              )}
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">
                {services.length} Service{services.length !== 1 ? "s" : ""}
              </span>
              {provider.phone && (
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">
                  📞 {provider.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            {provider.description && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#0a1f5c] mb-3">About</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{provider.description}</p>
              </div>
            )}

            {/* Services */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-lg font-bold text-[#0a1f5c]">Services Offered</h2>
                <p className="text-gray-400 text-sm">{services.length} approved services</p>
              </div>

              {services.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl mb-3">🔨</span>
                  <p className="text-gray-400">No approved services yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {services.map(svc => (
                    <div
                      key={svc.id}
                      onClick={() => { setSelectedService(svc); setBookingError(""); }}
                      className={`px-6 py-5 cursor-pointer transition hover:bg-[#f5f9ff] ${selectedService?.id === svc.id ? "bg-[#eaf2ff] border-l-4 border-[#1a6ff0]" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#eaf2ff] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {serviceIcons[svc.service] || "🔨"}
                          </div>
                          <div>
                            <p className="font-bold text-[#0a1f5c]">{svc.service}</p>
                            {svc.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{svc.description}</p>}
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <span>{paymentIcons[svc.payment_method]}</span>
                              <span>{svc.payment_method} · {svc.payment_account}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-[#1a6ff0]">ETB {svc.price}</p>
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedService(svc); setBookingError(""); }}
                            className="text-xs bg-[#1a6ff0] text-white px-3 py-1.5 rounded-lg hover:bg-[#1559c7] transition cursor-pointer mt-1"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-lg font-bold text-[#0a1f5c]">Customer Reviews</h2>
                <p className="text-gray-400 text-sm">
                  {reviews.length > 0 ? `${reviews.length} reviews · ★ ${avgRating} average` : "No reviews yet"}
                </p>
              </div>

              {/* Rating Summary */}
              {reviews.length > 0 && (
                <div className="px-6 py-4 border-b border-gray-50 bg-[#f5f9ff]">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[#0a1f5c]">{avgRating}</p>
                      <div className="flex gap-0.5 justify-center mt-1">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} className={`text-lg ${i <= Math.round(Number(avgRating)) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-4">{star}</span>
                            <span className="text-yellow-400 text-xs">★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-4">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl mb-3">⭐</span>
                  <p className="text-gray-400 font-medium mb-1">No reviews yet</p>
                  <p className="text-gray-300 text-sm">Be the first to review after your booking!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {reviews.map(r => (
                    <div key={r.id} className="px-6 py-4 hover:bg-[#f5f9ff] transition">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-[#dbeafe] rounded-full flex items-center justify-center text-xs font-bold text-[#1a6ff0] flex-shrink-0">
                          C
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(i => (
                                <span key={i} className={`text-sm ${i <= r.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-[#0a1f5c] to-[#1a6ff0] px-6 py-5">
                <h2 className="text-white font-bold text-lg">Book a Service</h2>
                <p className="text-blue-200 text-xs mt-0.5">Select a service and pick a date</p>
              </div>

              <div className="p-6">
                {bookingSuccess ? (
                  <div className="text-center py-6">
                    <span className="text-5xl mb-3 block">✅</span>
                    <p className="font-bold text-green-600 mb-1">Booking Submitted!</p>
                    <p className="text-xs text-gray-400">Redirecting to your bookings...</p>
                  </div>
                ) : (
                  <>
                    {/* Selected Service */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-[#0a1f5c] uppercase tracking-wide mb-2 block">Selected Service</label>
                      {selectedService ? (
                        <div className="bg-[#eaf2ff] rounded-xl p-4 flex items-center gap-3">
                          <span className="text-2xl">{serviceIcons[selectedService.service] || "🔨"}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-[#0a1f5c] text-sm">{selectedService.service}</p>
                            <p className="text-xs text-[#1a6ff0] font-bold">ETB {selectedService.price}</p>
                          </div>
                          <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg">×</button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-[#dbeafe] rounded-xl p-4 text-center">
                          <p className="text-xs text-gray-400">Click a service on the left to select it</p>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-[#0a1f5c] uppercase tracking-wide mb-2 block">Preferred Date *</label>
                      <input
                        type="date"
                        value={bookingDate}
                        min={minDateStr}
                        onChange={e => setBookingDate(e.target.value)}
                        className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition cursor-pointer"
                      />
                    </div>

                    {/* Payment Info */}
                    {selectedService && (
                      <div className="mb-4 bg-[#f5f9ff] rounded-xl p-4 border border-[#dbeafe]">
                        <p className="text-xs font-semibold text-[#0a1f5c] uppercase tracking-wide mb-2">Payment Info</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">{paymentIcons[selectedService.payment_method] || "💳"}</span>
                          <div>
                            <p className="font-medium text-[#0a1f5c]">{selectedService.payment_method}</p>
                            <p className="text-xs text-gray-400">{selectedService.payment_account}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Pay directly to the provider using the above method</p>
                      </div>
                    )}

                    {/* Price Summary */}
                    {selectedService && (
                      <div className="mb-6 border-t border-gray-100 pt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Service Price</span>
                          <span className="font-semibold text-[#0a1f5c]">ETB {selectedService.price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Platform Fee</span>
                          <span className="text-green-500 font-semibold">Free</span>
                        </div>
                      </div>
                    )}

                    {bookingError && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-500 text-xs px-3 py-2 rounded-xl">
                        {bookingError}
                      </div>
                    )}

                    <button
                      onClick={handleBook}
                      disabled={bookingLoading || !selectedService || !bookingDate}
                      className="w-full bg-[#1a6ff0] text-white font-bold py-3 rounded-xl hover:bg-[#1559c7] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200"
                    >
                      {bookingLoading ? "Booking..." : !isAuthenticated ? "Login to Book" : "Confirm Booking"}
                    </button>

                    {!isAuthenticated && (
                      <p className="text-center text-xs text-gray-400 mt-3">
                        <span onClick={() => navigate("/login")} className="text-[#1a6ff0] font-semibold cursor-pointer hover:underline">Login</span> or{" "}
                        <span onClick={() => navigate("/signup")} className="text-[#1a6ff0] font-semibold cursor-pointer hover:underline">Sign up</span> to book
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
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

export default ProviderDetail;