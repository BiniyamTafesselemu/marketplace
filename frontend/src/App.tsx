import { Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/providers" element={<div>Providers Page</div>} />
      <Route path="/providers/:id" element={<div>Provider Detail Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
    </Routes>
  )
}

export default App