import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import BillHistory from './pages/BillHistory'
import Inventory from './pages/Inventory'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import PurchaseEntry from './pages/PurchaseEntry'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/pos" element={<Layout><POS /></Layout>} />
        <Route path="/bills" element={<Layout><BillHistory /></Layout>} />
        <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
        <Route path="/customers" element={<Layout><Customers /></Layout>} />
        <Route path="/suppliers" element={<Layout><Suppliers /></Layout>} />
        <Route path="/purchase" element={<Layout><PurchaseEntry /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
