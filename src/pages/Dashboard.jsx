import { useAppContext } from '../context/AppContext'
import { IndianRupee, TrendingUp, Users, Package, ShoppingCart, TriangleAlert } from 'lucide-react'

export default function Dashboard() {
  const { products, customers, bills } = useAppContext()

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayBills = bills.filter(b => b.date?.slice(0, 10) === todayStr)
  const todayRevenue = todayBills.reduce((s, b) => s + b.total, 0)
  const totalRevenue = bills.reduce((s, b) => s + b.total, 0)
  const lowStockProducts = products.filter(p => p.stock < 10)
  const totalUdhar = customers.reduce((s, c) => s + c.udhar, 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-[#002046] tracking-tight">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Today's Revenue</p>
              <h3 className="text-3xl font-black text-[#002046]">₹{todayRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 bg-[#f0eee7] rounded flex items-center justify-center">
              <IndianRupee size={20} className="text-[#002046]" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-l-4 border-[#775a19] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Revenue</p>
              <h3 className="text-3xl font-black text-[#002046]">₹{totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 bg-[#ffddb9] rounded flex items-center justify-center">
              <TrendingUp size={20} className="text-[#775a19]" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-l-4 border-[#2e7d32] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Customers</p>
              <h3 className="text-3xl font-black text-[#002046]">{customers.length}</h3>
            </div>
            <div className="w-10 h-10 bg-[#e8f5e9] rounded flex items-center justify-center">
              <Users size={20} className="text-[#2e7d32]" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-l-4 border-[#ba1a1a] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pending Udhar</p>
              <h3 className="text-3xl font-black text-[#ba1a1a]">₹{totalUdhar.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 bg-[#ffdad6] rounded flex items-center justify-center">
              <IndianRupee size={20} className="text-[#ba1a1a]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-[#002046]">Recent Bills</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
                <th className="p-4 font-semibold">Bill #</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bills.slice(0, 5).map(b => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-[#002046]">{b.id}</td>
                  <td className="p-4 text-sm font-bold text-[#002046]">₹{b.total.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      b.paymentMode === 'Cash' ? 'bg-[#e8f5e9] text-[#2e7d32]' :
                      b.paymentMode === 'UPI' ? 'bg-[#ffddb9] text-[#775a19]' :
                      'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}>{b.paymentMode}</span>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr><td colSpan="3" className="p-8 text-center text-slate-500">No bills yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <TriangleAlert size={16} className="text-[#ba1a1a]" />
            <h3 className="font-bold text-[#002046]">Low Stock Alerts</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold text-center">Stock</th>
                <th className="p-4 font-semibold">Category</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-[#002046]">{p.name}</td>
                  <td className="p-4 text-center">
                    <span className="bg-[#ffdad6] text-[#ba1a1a] px-2 py-1 rounded text-xs font-bold">
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{p.category}</td>
                </tr>
              ))}
              {lowStockProducts.length === 0 && (
                <tr><td colSpan="3" className="p-8 text-center text-slate-500 text-sm">All products well stocked! ✓</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
