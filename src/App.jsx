import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import BillHistory from './pages/BillHistory'
import Inventory from './pages/Inventory'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Agencies from './pages/Agencies'
import PurchaseEntry from './pages/PurchaseEntry'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001229] via-[#002046] to-[#003366] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-white animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-medium">Loading your store...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute><Layout><POS /></Layout></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute><Layout><BillHistory /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><Layout><Suppliers /></Layout></ProtectedRoute>} />
        <Route path="/agencies" element={<ProtectedRoute><Layout><Agencies /></Layout></ProtectedRoute>} />
        <Route path="/purchase" element={<ProtectedRoute><Layout><PurchaseEntry /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001229] via-[#002046] to-[#003366] flex items-center justify-center">
        <Loader2 size={48} className="text-white animate-spin" />
      </div>
    )
  }
  if (user) return <Navigate to="/" replace />
  return <Login />
}
