import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/providers" element={<div>Providers Page</div>} />
      <Route path="/providers/:id" element={<div>Provider Detail Page</div>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard Page</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App