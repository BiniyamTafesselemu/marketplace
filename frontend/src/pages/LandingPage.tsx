import { useNavigate } from "react-router-dom";
import { useState } from "react";

function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo("hero")}>
          <span className="text-2xl">🔧</span>
          <span className="text-xl font-bold text-[#0a1f5c]">ServiceHub</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <button onClick={() => scrollTo("about")} className="hover:text-[#1a6ff0] transition cursor-pointer">About</button>
          <button onClick={() => scrollTo("services")} className="hover:text-[#1a6ff0] transition cursor-pointer">Services</button>
          <button onClick={() => scrollTo("providers")} className="hover:text-[#1a6ff0] transition cursor-pointer">Providers</button>
          <button onClick={() => scrollTo("pricing")} className="hover:text-[#1a6ff0] transition cursor-pointer">Pricing</button>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="text-sm font-medium text-gray-600 hover:text-[#1a6ff0] px-4 py-2 transition cursor-pointer">Login</button>
          <button onClick={() => navigate("/signup")} className="text-sm font-semibold bg-[#1a6ff0] hover:bg-[#1559c7] text-white px-5 py-2 rounded-full transition cursor-pointer">Get Started</button>
        </div>
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b px-8 py-4 flex flex-col gap-4 text-sm font-medium text-gray-600 z-40">
          <button onClick={() => { scrollTo("about"); setMenuOpen(false); }}>About</button>
          <button onClick={() => { scrollTo("services"); setMenuOpen(false); }}>Services</button>
          <button onClick={() => { scrollTo("providers"); setMenuOpen(false); }}>Providers</button>
          <button onClick={() => { scrollTo("pricing"); setMenuOpen(false); }}>Pricing</button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/signup")} className="bg-[#1a6ff0] text-white px-4 py-2 rounded-full">Get Started</button>
        </div>
      )}

      {/* Hero */}
      <section id="hero" className="flex flex-col-reverse lg:flex-row items-center justify-between px-8 lg:px-20 py-16 gap-12 bg-gradient-to-br from-white to-[#eaf2ff]">
        <div className="lg:w-1/2">
          <span className="inline-block bg-[#dbeafe] text-[#1a6ff0] text-xs font-semibold px-3 py-1 rounded-full mb-4">
            🇪🇹 Built for Ethiopia
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0a1f5c] leading-tight mb-4">
            Trusted Services, <br />
            <span className="text-[#1a6ff0]">Right at Your Door.</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Connect with verified local professionals for plumbing, electrical, cleaning, and more — fast, reliable, and affordable.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button onClick={() => navigate("/signup")} className="bg-[#1a6ff0] hover:bg-[#1559c7] text-white font-semibold px-6 py-3 rounded-full transition shadow-md cursor-pointer">
              Create Account
            </button>
            <button onClick={() => scrollTo("providers")} className="border border-gray-300 hover:border-[#1a6ff0] text-gray-700 font-semibold px-6 py-3 rounded-full transition cursor-pointer">
              Browse Providers
            </button>
          </div>
          <div className="flex gap-8 mt-10">
            <div>
              <p className="text-2xl font-bold text-[#0a1f5c]">500+</p>
              <p className="text-gray-400 text-sm">Verified Providers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0a1f5c]">10k+</p>
              <p className="text-gray-400 text-sm">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0a1f5c]">50+</p>
              <p className="text-gray-400 text-sm">Service Categories</p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 flex justify-center relative py-8">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-72 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#dbeafe] rounded-full flex items-center justify-center text-xl">🔧</div>
              <div>
                <p className="font-semibold text-[#0a1f5c] text-sm">Abel Plumbing</p>
                <p className="text-xs text-gray-400">Bole, Addis Ababa</p>
              </div>
              <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <div className="flex items-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
              <span className="text-xs text-gray-400 ml-1">5.0 (128 reviews)</span>
            </div>
            <div className="bg-[#eaf2ff] rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Service</p>
              <p className="text-sm font-semibold text-[#0a1f5c]">Pipe Installation & Repair</p>
              <p className="text-xs text-[#1a6ff0] font-medium mt-1">Starting from ETB 500</p>
            </div>
            <button className="w-full bg-[#1a6ff0] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#1559c7] transition cursor-pointer">
              Book Now
            </button>
          </div>
          <div className="absolute top-0 right-0 bg-white rounded-2xl shadow-lg p-4 w-44 z-20">
            <p className="text-xs text-gray-400 mb-1">Booking Confirmed</p>
            <p className="text-sm font-bold text-[#0a1f5c]">Electrical Repair</p>
            <p className="text-xs text-gray-400 mt-1">Today, 2:00 PM</p>
            <span className="inline-block mt-2 text-xs bg-blue-100 text-[#1a6ff0] px-2 py-0.5 rounded-full font-medium">✓ Confirmed</span>
          </div>
          <div className="absolute bottom-0 left-0 bg-white rounded-2xl shadow-lg p-4 w-44 z-20">
            <p className="text-xs text-gray-400 mb-1">New Review</p>
            <div className="flex gap-0.5 mb-1">
              {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}
            </div>
            <p className="text-xs text-gray-600">"Excellent service!"</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-8 lg:px-20 py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-[#dbeafe] text-[#1a6ff0] text-xs font-semibold px-3 py-1 rounded-full mb-4">About Us</span>
          <h2 className="text-3xl font-bold text-[#0a1f5c] mb-4">We're on a mission to make services accessible</h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-12">
            ServiceHub was built to solve a real problem in Ethiopia — finding trustworthy, skilled professionals is hard. We connect verified providers with customers who need them, making the process fast, transparent, and safe.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { icon: "🎯", title: "Our Mission", desc: "To make quality services accessible to every Ethiopian household." },
              { icon: "👁️", title: "Our Vision", desc: "A marketplace where every transaction is trusted, transparent, and fair." },
              { icon: "💡", title: "Our Values", desc: "Integrity, reliability, and community — we build for people, not just profit." },
            ].map((item, i) => (
              <div key={i} className="bg-[#eaf2ff] rounded-2xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-[#0a1f5c] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="px-8 lg:px-20 py-20 bg-[#eaf2ff]">
        <div className="text-center mb-12">
          <span className="inline-block bg-white text-[#1a6ff0] text-xs font-semibold px-3 py-1 rounded-full mb-4">Services</span>
          <h2 className="text-3xl font-bold text-[#0a1f5c] mb-2">What We Offer</h2>
          <p className="text-gray-500">Browse our wide range of professional services</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: "🔧", name: "Plumbing" },
            { icon: "⚡", name: "Electrical" },
            { icon: "🧹", name: "Cleaning" },
            { icon: "🎨", name: "Painting" },
            { icon: "🪟", name: "Carpentry" },
            { icon: "❄️", name: "AC Repair" },
            { icon: "🚗", name: "Auto Service" },
            { icon: "📱", name: "Electronics" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition cursor-pointer group">
              <div className="text-4xl mb-3">{s.icon}</div>
              <p className="font-semibold text-[#0a1f5c] group-hover:text-[#1a6ff0] transition text-sm">{s.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Providers */}
      <section id="providers" className="px-8 lg:px-20 py-20 bg-white">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#dbeafe] text-[#1a6ff0] text-xs font-semibold px-3 py-1 rounded-full mb-4">Providers</span>
          <h2 className="text-3xl font-bold text-[#0a1f5c] mb-2">Top Rated Providers</h2>
          <p className="text-gray-500">Trusted professionals ready to help you</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Abel Tadesse", service: "Plumbing", location: "Bole, Addis Ababa", rating: 5, reviews: 128, price: "ETB 500" },
            { name: "Sara Haile", service: "Cleaning", location: "Kirkos, Addis Ababa", rating: 5, reviews: 94, price: "ETB 300" },
            { name: "Dawit Bekele", service: "Electrical", location: "Yeka, Addis Ababa", rating: 4, reviews: 76, price: "ETB 600" },
          ].map((p, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#dbeafe] rounded-full flex items-center justify-center text-xl font-bold text-[#1a6ff0]">
                  {p.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#0a1f5c]">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.location}</p>
                </div>
                <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{p.service}</p>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`text-sm ${i <= p.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                ))}
                <span className="text-xs text-gray-400 ml-1">({p.reviews} reviews)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1a6ff0]">From {p.price}</span>
                <button onClick={() => navigate("/login")} className="text-xs bg-[#1a6ff0] text-white px-3 py-1.5 rounded-lg hover:bg-[#1559c7] transition cursor-pointer">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-8 lg:px-20 py-20 bg-[#eaf2ff]">
        <div className="text-center mb-12">
          <span className="inline-block bg-white text-[#1a6ff0] text-xs font-semibold px-3 py-1 rounded-full mb-4">Pricing</span>
          <h2 className="text-3xl font-bold text-[#0a1f5c] mb-2">Simple, Transparent Pricing</h2>
          <p className="text-gray-500">No hidden fees. Pay only for what you use.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { plan: "Basic", price: "Free", desc: "Perfect for customers", features: ["Browse providers", "Book services", "Leave reviews", "Email support"] },
            { plan: "Provider", price: "ETB 199/mo", desc: "For service providers", features: ["Create provider profile", "Receive bookings", "Priority listing", "Analytics dashboard"], highlight: true },
            { plan: "Business", price: "ETB 499/mo", desc: "For teams & agencies", features: ["Multiple providers", "Advanced analytics", "Dedicated support", "Custom branding"] },
          ].map((p, i) => (
            <div key={i} className={`rounded-2xl p-8 ${p.highlight ? "bg-[#1a6ff0] text-white shadow-xl scale-105" : "bg-white"}`}>
              <p className={`text-sm font-semibold mb-1 ${p.highlight ? "text-blue-100" : "text-gray-400"}`}>{p.plan}</p>
              <p className={`text-3xl font-bold mb-1 ${p.highlight ? "text-white" : "text-[#0a1f5c]"}`}>{p.price}</p>
              <p className={`text-sm mb-6 ${p.highlight ? "text-blue-100" : "text-gray-400"}`}>{p.desc}</p>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className={`text-sm flex items-center gap-2 ${p.highlight ? "text-blue-50" : "text-gray-600"}`}>
                    <span className={p.highlight ? "text-white" : "text-[#1a6ff0]"}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/signup")} className={`w-full py-3 rounded-xl font-semibold transition cursor-pointer ${p.highlight ? "bg-white text-[#1a6ff0] hover:bg-blue-50" : "bg-[#1a6ff0] text-white hover:bg-[#1559c7]"}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a6ff0] px-8 lg:px-20 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to Get Started?</h2>
        <p className="text-blue-100 mb-8">Join thousands of customers finding trusted service providers every day.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button onClick={() => navigate("/signup")} className="bg-white text-[#1a6ff0] font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition cursor-pointer">
            Create Account
          </button>
          <button onClick={() => scrollTo("providers")} className="border border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-[#1559c7] transition cursor-pointer">
            Browse Providers
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 lg:px-20 py-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
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

export default LandingPage;