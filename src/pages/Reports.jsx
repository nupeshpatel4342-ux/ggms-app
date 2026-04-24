import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { FileText, IndianRupee, TrendingUp, TrendingDown, Package, BarChart3 } from 'lucide-react'

export default function Reports() {
  const { bills, customers, purchases, products } = useAppContext()
  const [dateFilter, setDateFilter] = useState('all')

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().slice(0, 10)

  const filteredBills = bills.filter(b => {
    if (b.status === 'void') return false
    const d = b.date?.slice(0, 10)
    if (dateFilter === 'today') return d === todayStr
    if (dateFilter === 'week') return d >= weekAgo
    if (dateFilter === 'month') return d >= monthAgo
    return true
  })

  const filteredPurchases = purchases.filter(p => {
    const d = p.date?.slice(0, 10)
    if (dateFilter === 'today') return d === todayStr
    if (dateFilter === 'week') return d >= weekAgo
    if (dateFilter === 'month') return d >= monthAgo
    return true
  })

  const totalRevenue = filteredBills.reduce((s, b) => s + b.total, 0)
  const cashRevenue = filteredBills.filter(b => b.paymentMode === 'Cash').reduce((s, b) => s + b.total, 0)
  const upiRevenue = filteredBills.filter(b => b.paymentMode === 'UPI').reduce((s, b) => s + b.total, 0)
  const udharRevenue = filteredBills.filter(b => b.paymentMode === 'Udhar').reduce((s, b) => s + b.total, 0)
  const totalUdhar = customers.reduce((s, c) => s + c.udhar, 0)
  const totalPurchaseCost = filteredPurchases.reduce((s, p) => s + p.total, 0)

  // Profit calculation from bills (selling - purchase price per item)
  const totalCostFromBills = filteredBills.reduce((s, b) => {
    return s + b.items.reduce((is, item) => is + (item.purchasePrice || 0) * item.quantity, 0)
  }, 0)
  const grossProfit = totalRevenue - totalCostFromBills

  // Category-wise sales
  const categoryMap = {}
  filteredBills.forEach(b => {
    b.items.forEach(item => {
      const cat = item.category || 'Other'
      if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, qty: 0 }
      categoryMap[cat].revenue += item.sellingPrice * item.quantity
      categoryMap[cat].qty += item.quantity
    })
  })
  const categorySales = Object.entries(categoryMap).sort((a, b) => b[1].revenue - a[1].revenue)

  // Top selling products
  const productMap = {}
  filteredBills.forEach(b => {
    b.items.forEach(item => {
      if (!productMap[item.id]) productMap[item.id] = { name: item.name, qty: 0, revenue: 0 }
      productMap[item.id].qty += item.quantity
      productMap[item.id].revenue += item.sellingPrice * item.quantity
    })
  })
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8)

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#002046] tracking-tight">Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Sales analytics, profit tracking and business insights.</p>
        </div>
        <div className="flex gap-2">
          {[{ id: 'today', label: 'Today' }, { id: 'week', label: '7 Days' }, { id: 'month', label: '30 Days' }, { id: 'all', label: 'All Time' }].map(f => (
            <button key={f.id} onClick={() => setDateFilter(f.id)}
              className={`px-4 py-2 rounded text-sm font-bold transition-colors ${dateFilter === f.id ? 'bg-[#002046] text-white' : 'bg-white text-slate-600 hover:bg-slate-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-2xl font-black text-[#002046]">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#2e7d32] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gross Profit</p>
          <h3 className={`text-2xl font-black ${grossProfit >= 0 ? 'text-[#2e7d32]' : 'text-[#ba1a1a]'}`}>₹{grossProfit.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#775a19] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Purchase Cost</p>
          <h3 className="text-2xl font-black text-[#775a19]">₹{totalPurchaseCost.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Bills</p>
          <h3 className="text-2xl font-black text-blue-600">{filteredBills.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#ba1a1a] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Udhar</p>
          <h3 className="text-2xl font-black text-[#ba1a1a]">₹{totalUdhar.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Payment Mode Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-[#002046] mb-4 flex items-center gap-2"><BarChart3 size={18} /> Payment Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Cash', value: cashRevenue, color: '#2e7d32', bg: '#e8f5e9' },
              { label: 'UPI', value: upiRevenue, color: '#775a19', bg: '#ffddb9' },
              { label: 'Udhar', value: udharRevenue, color: '#ba1a1a', bg: '#ffdad6' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-bold" style={{ color: item.color }}>₹{item.value.toLocaleString()}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full transition-all duration-500" style={{
                    width: totalRevenue > 0 ? `${(item.value / totalRevenue * 100)}%` : '0%',
                    backgroundColor: item.color
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category-wise Sales */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-[#002046] mb-4 flex items-center gap-2"><Package size={18} /> Category-wise Sales</h3>
          {categorySales.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {categorySales.slice(0, 6).map(([cat, data]) => (
                <div key={cat} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{cat}</p>
                    <p className="text-[10px] text-slate-400">{data.qty} items sold</p>
                  </div>
                  <span className="font-bold text-[#002046]">₹{data.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-[#002046] mb-4 flex items-center gap-2"><TrendingUp size={18} /> Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#f0eee7] flex items-center justify-center text-xs font-bold text-[#002046]">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.qty} sold</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#002046] text-sm">₹{p.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase History + Recent Invoices */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-[#002046]">Recent Invoices</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-slate-200">
                <th className="p-3 font-semibold">Invoice</th>
                <th className="p-3 font-semibold text-right">Amount</th>
                <th className="p-3 font-semibold text-center">Mode</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.slice(0, 8).map(b => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-[#002046] text-sm">{b.id}</p>
                    <p className="text-[10px] text-slate-400">{new Date(b.date).toLocaleDateString()}</p>
                  </td>
                  <td className="p-3 text-right font-bold text-[#002046]">₹{b.total.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      b.paymentMode === 'Udhar' ? 'bg-[#ffdad6] text-[#ba1a1a]' : b.paymentMode === 'UPI' ? 'bg-[#ffddb9] text-[#775a19]' : 'bg-[#e8f5e9] text-[#2e7d32]'
                    }`}>{b.paymentMode}</span>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-slate-500">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-[#002046]">Recent Purchases</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-slate-200">
                <th className="p-3 font-semibold">Purchase ID</th>
                <th className="p-3 font-semibold text-center">Items</th>
                <th className="p-3 font-semibold text-right">Total</th>
                <th className="p-3 font-semibold text-right">Pending</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.slice(0, 8).map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-[#002046] text-sm">{p.id}</p>
                    <p className="text-[10px] text-slate-400">{new Date(p.date).toLocaleDateString()}</p>
                  </td>
                  <td className="p-3 text-center text-sm text-slate-600">{p.items.length}</td>
                  <td className="p-3 text-right font-bold text-[#002046]">₹{p.total.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    {p.pendingAmount > 0 ? <span className="font-bold text-[#ba1a1a]">₹{p.pendingAmount.toFixed(2)}</span> : <span className="text-[#2e7d32] font-bold">Paid</span>}
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && <tr><td colSpan="4" className="py-4 text-center text-slate-500">No purchases yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
