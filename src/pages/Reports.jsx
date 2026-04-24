import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { FileText, IndianRupee, TrendingUp } from 'lucide-react'

export default function Reports() {
  const { bills, customers } = useAppContext()
  const [dateFilter, setDateFilter] = useState('all')

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().slice(0, 10)

  const filteredBills = bills.filter(b => {
    const d = b.date?.slice(0, 10)
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

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#002046] tracking-tight">Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Sales analytics and business insights.</p>
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

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Revenue</p>
          <h3 className="text-3xl font-black text-[#002046]">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#2e7d32] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Cash Collection</p>
          <h3 className="text-3xl font-black text-[#2e7d32]">₹{cashRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#775a19] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">UPI Collection</p>
          <h3 className="text-3xl font-black text-[#775a19]">₹{upiRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#ba1a1a] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Pending Udhar</p>
          <h3 className="text-3xl font-black text-[#ba1a1a]">₹{totalUdhar.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sales by Payment Mode */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-[#002046] mb-4">Sales by Payment Mode</h3>
          <div className="space-y-3">
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
                <div className="w-full h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full transition-all duration-500" style={{
                    width: totalRevenue > 0 ? `${(item.value / totalRevenue * 100)}%` : '0%',
                    backgroundColor: item.color
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
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
                      b.paymentMode === 'Udhar' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e8f5e9] text-[#2e7d32]'
                    }`}>{b.paymentMode}</span>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && <tr><td colSpan="4" className="py-4 text-center text-slate-500">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
