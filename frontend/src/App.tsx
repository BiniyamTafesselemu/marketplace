import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/dashboard/Bookings'
import Reviews from './pages/dashboard/Reviews'
import Payments from './pages/dashboard/Payments'
import Profile from './pages/dashboard/Profile'
import Settings from './pages/dashboard/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import Providers from './pages/Providers'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProviderDetail from './pages/ProviderDetail'
import ProviderDashboard from './pages/ProviderDashboard'

function App() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      login(token);
      navigate("/dashboard");
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/providers" element={<Providers />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/dashboard/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="/dashboard/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/providers/:id" element={<ProviderDetail />} />
      <Route path="/dashboard/provider" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />

    </Routes>
  )
}

export default App