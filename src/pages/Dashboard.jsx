import { useAppContext } from '../context/AppContext'
import { IndianRupee, TrendingUp, Users, Package, TriangleAlert, Clock, ShoppingCart } from 'lucide-react'

export default function Dashboard() {
  const { products, customers, bills, suppliers, profile } = useAppContext()

  const lowStockThreshold = profile?.lowStockAlert || 10
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayBills = bills.filter(b => b.date?.slice(0, 10) === todayStr && b.status !== 'void')
  const todayRevenue = todayBills.reduce((s, b) => s + b.total, 0)
  const totalRevenue = bills.filter(b => b.status !== 'void').reduce((s, b) => s + b.total, 0)
  const lowStockProducts = products.filter(p => p.stock < lowStockThreshold)
  const totalUdhar = customers.reduce((s, c) => s + c.udhar, 0)
  const supplierPending = suppliers.reduce((s, sup) => s + sup.pendingPayment, 0)

  // Today's profit
  const todayProfit = todayBills.reduce((s, b) => {
    const cost = b.items.reduce((is, item) => is + (item.purchasePrice || 0) * item.quantity, 0)
    return s + b.total - cost
  }, 0)

  // Expiry alerts
  const expiringProducts = products.filter(p => {
    if (!p.expiryDate) return false
    const diff = (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff > 0
  })
  const expiredProducts = products.filter(p => {
    if (!p.expiryDate) return false
    return new Date(p.expiryDate) < new Date()
  })

  // Top 5 selling products today
  const productMap = {}
  todayBills.forEach(b => {
    b.items.forEach(item => {
      if (!productMap[item.id]) productMap[item.id] = { name: item.name, qty: 0, revenue: 0 }
      productMap[item.id].qty += item.quantity
      productMap[item.id].revenue += item.sellingPrice * item.quantity
    })
  })
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-[#002046] tracking-tight">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Today's Revenue</p>
              <h3 className="text-2xl font-black text-[#002046]">₹{todayRevenue.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{todayBills.length} bills</p>
            </div>
            <div className="w-9 h-9 bg-[#f0eee7] rounded flex items-center justify-center"><IndianRupee size={18} className="text-[#002046]" /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border-l-4 border-[#2e7d32] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Today's Profit</p>
              <h3 className={`text-2xl font-black ${todayProfit >= 0 ? 'text-[#2e7d32]' : 'text-[#ba1a1a]'}`}>₹{todayProfit.toLocaleString()}</h3>
            </div>
            <div className="w-9 h-9 bg-[#e8f5e9] rounded flex items-center justify-center"><TrendingUp size={18} className="text-[#2e7d32]" /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border-l-4 border-[#775a19] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-2xl font-black text-[#002046]">₹{totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-9 h-9 bg-[#ffddb9] rounded flex items-center justify-center"><TrendingUp size={18} className="text-[#775a19]" /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border-l-4 border-[#ba1a1a] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Udhar</p>
              <h3 className="text-2xl font-black text-[#ba1a1a]">₹{totalUdhar.toLocaleString()}</h3>
            </div>
            <div className="w-9 h-9 bg-[#ffdad6] rounded flex items-center justify-center"><IndianRupee size={18} className="text-[#ba1a1a]" /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border-l-4 border-purple-500 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Supplier Due</p>
              <h3 className="text-2xl font-black text-purple-600">₹{supplierPending.toLocaleString()}</h3>
            </div>
            <div className="w-9 h-9 bg-purple-50 rounded flex items-center justify-center"><Package size={18} className="text-purple-500" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Recent Bills */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-[#002046] flex items-center gap-2"><ShoppingCart size={16} /> Recent Bills</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
                <th className="p-3 font-semibold">Bill #</th>
                <th className="p-3 font-semibold text-right">Amount</th>
                <th className="p-3 font-semibold text-center">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bills.filter(b => b.status !== 'void').slice(0, 5).map(b => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-sm font-bold text-[#002046]">{b.id}</td>
                  <td className="p-3 text-sm font-bold text-[#002046] text-right">₹{b.total.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      b.paymentMode === 'Cash' ? 'bg-[#e8f5e9] text-[#2e7d32]' :
                      b.paymentMode === 'UPI' ? 'bg-[#ffddb9] text-[#775a19]' :
                      'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}>{b.paymentMode}</span>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-slate-500 text-sm">No bills yet.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <TriangleAlert size={16} className="text-[#ba1a1a]" />
            <h3 className="font-bold text-[#002046]">Low Stock ({lowStockProducts.length})</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <tbody>
                {lowStockProducts.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-sm font-bold text-[#002046]">{p.name}</td>
                    <td className="p-3 text-center">
                      <span className="bg-[#ffdad6] text-[#ba1a1a] px-2 py-1 rounded text-xs font-bold">{p.stock} {p.unit}</span>
                    </td>
                  </tr>
                ))}
                {lowStockProducts.length === 0 && <tr><td colSpan="2" className="p-6 text-center text-slate-500 text-sm">All products well stocked! ✓</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiry Alerts + Top Products */}
        <div className="space-y-6">
          {(expiredProducts.length > 0 || expiringProducts.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <Clock size={16} className="text-amber-600" />
                <h3 className="font-bold text-[#002046]">Expiry Alerts</h3>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {expiredProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">EXPIRED</span>
                  </div>
                ))}
                {expiringProducts.map(p => {
                  const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={p.id} className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">{days}d left</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#2e7d32]" />
              <h3 className="font-bold text-[#002046]">Today's Top Products</h3>
            </div>
            <div className="p-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No sales today yet.</p>
              ) : topProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#f0eee7] flex items-center justify-center text-[10px] font-bold text-[#002046]">{i + 1}</span>
                    <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#002046]">₹{p.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
