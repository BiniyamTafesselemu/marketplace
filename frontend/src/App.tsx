import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/providers" element={<div>Providers Page</div>} />
      <Route path="/providers/:id" element={<div>Provider Detail Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      <Route path="/signup" element={<div>Signup Page</div>} />
    </Routes>
  )
}

export default App