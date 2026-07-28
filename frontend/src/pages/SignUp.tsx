import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.email || !form.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        role
      });
      login(res.data.token);

      // If they want to be a provider, send them to profile to set up
      if (role === "provider") {
        navigate("/dashboard/profile");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf2ff] via-[#dbeafe] to-[#bfdbfe] flex items-center justify-center p-4">

      <button onClick={() => navigate("/")} className="absolute top-6 left-6 flex items-center gap-2 text-[#1a6ff0] text-sm font-medium hover:underline cursor-pointer">
        ← Back to Home
      </button>

      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl">

        {/* Left Panel */}
        <div className="hidden lg:flex w-1/2 bg-[#0a1f5c] flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1a6ff0] rounded-full opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#60a5fa] rounded-full opacity-10 translate-y-1/2 -translate-x-1/2" />

          <div className="flex items-center gap-2 z-10 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl">🔧</span>
            <span className="text-xl font-bold text-white">ServiceHub</span>
          </div>

          <div className="z-10">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Join Thousands <br />
              <span className="text-[#60a5fa]">of Happy Users.</span>
            </h2>
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              Whether you need a service or want to offer one — ServiceHub is the place to be.
            </p>
            <div className="space-y-4">
              {[
                { icon: "🏠", text: "Find services for your home" },
                { icon: "💼", text: "Offer your skills and earn" },
                { icon: "🤝", text: "Connect with your community" },
                { icon: "📱", text: "Manage everything in one place" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{f.icon}</span>
                  <p className="text-gray-300 text-sm">{f.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-8 mt-10">
              <div><p className="text-[#60a5fa] text-2xl font-bold">500+</p><p className="text-gray-500 text-xs">Providers</p></div>
              <div><p className="text-[#60a5fa] text-2xl font-bold">10k+</p><p className="text-gray-500 text-xs">Customers</p></div>
              <div><p className="text-[#60a5fa] text-2xl font-bold">50+</p><p className="text-gray-500 text-xs">Categories</p></div>
            </div>
          </div>

          <p className="text-gray-600 text-xs z-10">© 2026 ServiceHub. All rights reserved.</p>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
          <div className="w-full max-w-md">

            <div className="lg:hidden mb-8 text-center cursor-pointer" onClick={() => navigate("/")}>
              <span className="text-2xl font-bold text-[#0a1f5c]">🔧 ServiceHub</span>
            </div>

            <div className="mb-6">
              <h2 className="text-3xl font-bold text-[#0a1f5c] mb-1">Create an account 🚀</h2>
              <p className="text-gray-400 text-sm">Join ServiceHub today — it's free!</p>
            </div>

            {/* Role Toggle */}
            <div className="flex bg-[#eaf2ff] rounded-xl p-1 mb-6">
              <button
                onClick={() => setRole("customer")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${role === "customer" ? "bg-white text-[#1a6ff0] shadow-sm" : "text-gray-400"}`}
              >
                👤 I need a service
              </button>
              <button
                onClick={() => setRole("provider")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${role === "provider" ? "bg-white text-[#1a6ff0] shadow-sm" : "text-gray-400"}`}
              >
                🔧 I offer a service
              </button>
            </div>

            {role === "provider" && (
              <div className="mb-4 bg-[#eaf2ff] border border-[#dbeafe] rounded-xl p-3 text-xs text-[#1a6ff0]">
                ℹ️ You'll set up your provider profile after registration and submit documents for admin verification.
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Google Button */}
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 border-2 border-[#dbeafe] bg-[#eaf2ff] rounded-xl py-3 px-6 hover:bg-[#dbeafe] transition cursor-pointer mb-6"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span className="text-[#0a1f5c] font-semibold text-sm">Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[#dbeafe]" />
              <span className="text-gray-400 text-xs">or sign up with email</span>
              <div className="flex-1 h-px bg-[#dbeafe]" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">First Name *</label>
                  <input
                    type="text"
                    placeholder="Abebe"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Last Name</label>
                  <input
                    type="text"
                    placeholder="Kebede"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Email Address *</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Password * (min 6 chars)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Confirm Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition"
                />
              </div>

              <p className="text-xs text-gray-400">
                By signing up, you agree to our{" "}
                <span className="text-[#1a6ff0] cursor-pointer hover:underline">Terms of Service</span>{" "}
                and{" "}
                <span className="text-[#1a6ff0] cursor-pointer hover:underline">Privacy Policy</span>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a6ff0] hover:bg-[#1559c7] text-white font-bold rounded-xl py-3 transition cursor-pointer shadow-md shadow-blue-200 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : role === "provider" ? "Create Account & Set Up Profile" : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-[#1a6ff0] font-bold hover:underline cursor-pointer">
                Sign in here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;