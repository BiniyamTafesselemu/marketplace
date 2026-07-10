import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf2ff] via-[#dbeafe] to-[#bfdbfe] flex items-center justify-center p-4">

      {/* Back button */}
      <button onClick={() => navigate("/")} className="absolute top-6 left-6 flex items-center gap-2 text-[#1a6ff0] text-sm font-medium hover:underline cursor-pointer">
        ← Back to Home
      </button>

      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl">

        {/* Left Panel */}
        <div className="hidden lg:flex w-1/2 bg-[#0a1f5c] flex-col justify-between p-12 relative overflow-hidden">

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1a6ff0] rounded-full opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#60a5fa] rounded-full opacity-10 translate-y-1/2 -translate-x-1/2" />

          <div className="flex items-center gap-2 z-10">
            <span className="text-2xl">🔧</span>
            <span className="text-xl font-bold text-white">ServiceHub</span>
          </div>

          <div className="z-10">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Your Home, <br />
              <span className="text-[#60a5fa]">Our Professionals.</span>
            </h2>
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              Sign in to access hundreds of verified service providers across Addis Ababa and beyond.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                { icon: "✅", text: "Verified & background-checked providers" },
                { icon: "⚡", text: "Book in under 2 minutes" },
                { icon: "🔒", text: "Secure payments via Chapa" },
                { icon: "⭐", text: "Real reviews from real customers" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{f.icon}</span>
                  <p className="text-gray-300 text-sm">{f.text}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10">
              <div>
                <p className="text-[#60a5fa] text-2xl font-bold">500+</p>
                <p className="text-gray-500 text-xs">Providers</p>
              </div>
              <div>
                <p className="text-[#60a5fa] text-2xl font-bold">10k+</p>
                <p className="text-gray-500 text-xs">Customers</p>
              </div>
              <div>
                <p className="text-[#60a5fa] text-2xl font-bold">50+</p>
                <p className="text-gray-500 text-xs">Categories</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-xs z-10">© 2026 ServiceHub. All rights reserved.</p>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center cursor-pointer" onClick={() => navigate("/")}>
              <span className="text-2xl font-bold text-[#0a1f5c]">🔧 ServiceHub</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0a1f5c] mb-1">Welcome back 👋</h2>
              <p className="text-gray-400 text-sm">Sign in to continue to your account</p>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border-2 border-[#dbeafe] bg-[#eaf2ff] rounded-xl py-3 px-6 hover:bg-[#dbeafe] transition cursor-pointer mb-6"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span className="text-[#0a1f5c] font-semibold text-sm">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[#dbeafe]" />
              <span className="text-gray-400 text-xs">or sign in with email</span>
              <div className="flex-1 h-px bg-[#dbeafe]" />
            </div>

            {/* Email/Password */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#0a1f5c] mb-1.5 block uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border-2 border-[#dbeafe] bg-[#f5f9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a6ff0] focus:bg-white transition"
                />
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <a href="/forgot-password" className="text-xs text-[#1a6ff0] hover:underline">Forgot password?</a>
            </div>

            <button className="w-full bg-[#1a6ff0] hover:bg-[#1559c7] text-white font-bold rounded-xl py-3 transition cursor-pointer mb-6 shadow-md shadow-blue-200">
              Sign In
            </button>

            <p className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <span onClick={() => navigate("/signup")} className="text-[#1a6ff0] font-bold hover:underline cursor-pointer">
                Sign up here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;