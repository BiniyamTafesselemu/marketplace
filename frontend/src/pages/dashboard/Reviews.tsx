import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Review {
  id: number;
  booking_id: number;
  provider_id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Booking {
  id: number;
  provider_id: number;
  date: string;
  status: string;
  createdAt: string;
}

interface Provider {
  id: number;
  business_name: string;
  city: string;
  image: string;
}

function Reviews() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Record<number, Provider>>({});
  const [loading, setLoading] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reviewsRes, bookingsRes, providersRes] = await Promise.all([
        api.get("/reviews"),
        api.get("/bookings"),
        api.get("/providers")
      ]);

      const myReviews = reviewsRes.data.filter((r: Review) => r.customer_id === user?.id);
      setReviews(myReviews);

      // Only completed bookings that don't have a review yet
      const reviewedBookingIds = new Set(myReviews.map((r: Review) => r.booking_id));
      const completed = bookingsRes.data.filter(
        (b: Booking) => b.status === "completed" && !reviewedBookingIds.has(b.id)
      );
      setCompletedBookings(completed);

      const providerMap: Record<number, Provider> = {};
      providersRes.data.forEach((p: Provider) => { providerMap[p.id] = p; });
      setProviders(providerMap);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (bookingId: number, providerId: number) => {
    if (rating < 1) { setMessage("Please select a rating"); return; }
    setSubmitting(true);
    try {
      await api.post("/reviews", { booking_id: bookingId, rating, comment });
      setMessage("Review submitted successfully! ⭐");
      setShowReviewForm(null);
      setRating(5);
      setComment("");
      await fetchAll();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to submit review");
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
      setMessage("Review deleted.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete review", error);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-[#0a1f5c]">My Reviews</h1>
            <p className="text-xs text-gray-400">Reviews you've left for providers</p>
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
              message.includes("Failed") || message.includes("Please")
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-green-50 border-green-200 text-green-600"
            }`}>
              {message}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Reviews", value: reviews.length, icon: "⭐", color: "bg-yellow-50 text-yellow-500" },
              { label: "Average Rating", value: avgRating, icon: "📊", color: "bg-blue-50 text-[#1a6ff0]" },
              { label: "Pending Reviews", value: completedBookings.length, icon: "✍️", color: "bg-purple-50 text-purple-500" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-[#0a1f5c]">{s.value}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Completed Bookings to Review */}
          {completedBookings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-lg font-bold text-[#0a1f5c]">Bookings Awaiting Your Review</h2>
                <p className="text-gray-400 text-sm">Share your experience with these providers</p>
              </div>
              <div className="divide-y divide-gray-50">
                {completedBookings.map(b => {
                  const provider = providers[b.provider_id];
                  return (
                    <div key={b.id}>
                      <div className="px-6 py-5 hover:bg-[#f5f9ff] transition">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {provider?.image ? (
                              <img src={provider.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-[#dbeafe] rounded-xl flex items-center justify-center text-sm font-bold text-[#1a6ff0]">
                                {provider?.business_name?.[0] || "P"}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-[#0a1f5c]">{provider?.business_name || `Provider #${b.provider_id}`}</p>
                              <p className="text-xs text-gray-400">{provider?.city || ""}</p>
                              <p className="text-xs text-gray-400">Booking #{b.id} · Completed {new Date(b.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowReviewForm(showReviewForm === b.id ? null : b.id);
                              setRating(5);
                              setComment("");
                            }}
                            className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer flex-shrink-0 ${
                              showReviewForm === b.id
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-[#1a6ff0] text-white hover:bg-[#1559c7]"
                            }`}
                          >
                            {showReviewForm === b.id ? "Cancel" : "⭐ Leave Review"}
                          </button>
                        </div>

                        {/* Inline Review Form */}
                        {showReviewForm === b.id && (
                          <div className="mt-5 bg-[#f5f9ff] rounded-2xl p-5 border border-[#dbeafe]">
                            <h3 className="text-sm font-bold text-[#0a1f5c] mb-4">Rate your experience</h3>

                            {/* Star Rating */}
                            <div className="mb-4">
                              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Rating *</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="text-3xl transition cursor-pointer hover:scale-110"
                                  >
                                    <span className={star <= (hoveredStar || rating) ? "text-yellow-400" : "text-gray-200"}>★</span>
                                  </button>
                                ))}
                                <span className="text-sm text-gray-400 ml-2 self-center">
                                  {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
                                </span>
                              </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-4">
                              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Comment (Optional)</label>
                              <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Share your experience with this provider..."
                                rows={3}
                                className="w-full border-2 border-[#dbeafe] bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] transition resize-none"
                              />
                            </div>

                            <button
                              onClick={() => handleSubmitReview(b.id, b.provider_id)}
                              disabled={submitting}
                              className="bg-[#1a6ff0] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer disabled:opacity-50"
                            >
                              {submitting ? "Submitting..." : "Submit Review ⭐"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Reviews */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-[#0a1f5c]">Reviews You've Written</h2>
              <p className="text-gray-400 text-sm">{reviews.length} reviews</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
            ) : reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">⭐</span>
                <p className="text-gray-400 font-medium mb-2">No reviews yet</p>
                <p className="text-gray-300 text-sm">
                  {completedBookings.length > 0
                    ? "You have completed bookings above waiting for your review!"
                    : "Complete a booking to leave a review"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {reviews.map(r => {
                  const provider = providers[r.provider_id];
                  return (
                    <div key={r.id} className="px-6 py-5 hover:bg-[#f5f9ff] transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {provider?.image ? (
                            <img src={provider.image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-[#dbeafe] rounded-xl flex items-center justify-center text-sm font-bold text-[#1a6ff0] flex-shrink-0">
                              {provider?.business_name?.[0] || "P"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-[#0a1f5c] mb-1">{provider?.business_name || `Provider #${r.provider_id}`}</p>
                            <div className="flex gap-0.5 mb-2">
                              {[1, 2, 3, 4, 5].map(i => (
                                <span key={i} className={`text-base ${i <= r.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                              ))}
                              <span className="text-xs text-gray-400 ml-1">{r.rating}/5</span>
                            </div>
                            {r.comment && <p className="text-sm text-gray-600 mb-1">{r.comment}</p>}
                            <p className="text-xs text-gray-300">
                              Booking #{r.booking_id} · {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer ml-4 flex-shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Reviews;