import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Search, Plus, Phone, Wallet } from 'lucide-react'

export default function Customers() {
  const { customers, addCustomer, settleCustomerUdhar } = useAppContext()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showSettle, setShowSettle] = useState(false)
  const [settleCustomer, setSettleCustomer] = useState(null)
  const [settleAmt, setSettleAmt] = useState('')
  const [form, setForm] = useState({ name: '', mobile: '' })

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search))

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#002046] tracking-tight">Customers</h2>
          <p className="text-slate-500 text-sm mt-1">Manage customer profiles and Udhar balances.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-[#002046] text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-[#1b365d] transition-colors shadow-lg">
          <Plus size={18} /> New Customer
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Customers</p>
          <h3 className="text-3xl font-black text-[#002046]">{customers.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#ba1a1a] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pending Udhar Recievable</p>
          <h3 className="text-3xl font-black text-[#ba1a1a]">₹{customers.reduce((s, c) => s + c.udhar, 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#2e7d32] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Cleared Accounts</p>
          <h3 className="text-3xl font-black text-[#2e7d32]">{customers.filter(c => c.udhar === 0).length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name or mobile..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-[#002046]" />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
              <th className="p-4 font-semibold">Customer Details</th>
              <th className="p-4 font-semibold text-center">Mobile</th>
              <th className="p-4 font-semibold text-right">Udhar Balance</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f0eee7] flex items-center justify-center text-[#002046] font-bold flex-shrink-0">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#002046]">{c.name}</p>
                      <p className="text-xs text-slate-500">ID: CUST-{c.id.substring(c.id.length - 4)}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center text-sm font-medium text-slate-600">
                  <div className="flex items-center justify-center gap-2"><Phone size={14} className="text-slate-400" /> {c.mobile}</div>
                </td>
                <td className="p-4 text-right">
                  {c.udhar > 0 ? <span className="font-bold text-[#ba1a1a]">₹{c.udhar.toLocaleString()} Dr</span> : <span className="font-bold text-[#2e7d32]">₹0</span>}
                </td>
                <td className="p-4 text-right">
                  {c.udhar > 0 && (
                    <button onClick={() => { setSettleCustomer(c); setShowSettle(true) }}
                      className="px-3 py-1 bg-[#e8f5e9] text-[#2e7d32] rounded text-xs font-bold font-semibold hover:bg-[#c8e6c9] transition-colors inline-flex items-center gap-1">
                      <Wallet size={12} /> Settle
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#002046] text-lg">Add New Customer</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); addCustomer(form); setForm({ name: '', mobile: '' }); setShowAdd(false) }} className="p-6">
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Mobile Number *</label>
                <input required type="tel" pattern="[0-9]{10}" placeholder="10 digit number" value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-[#002046] text-white rounded hover:bg-[#1b365d] transition-colors">Add Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Udhar Modal */}
      {showSettle && settleCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#002046] text-lg">Settle Udhar</h3>
              <button onClick={() => setShowSettle(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); settleCustomerUdhar(settleCustomer.id, parseFloat(settleAmt)); setShowSettle(false); setSettleAmt('') }} className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Current pending Udhar for <strong className="text-[#002046]">{settleCustomer.name}</strong> is <strong className="text-[#ba1a1a]">₹{settleCustomer.udhar.toLocaleString()}</strong>.
              </p>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Amount Given (₹)</label>
                <input required type="number" step="0.01" max={settleCustomer.udhar} value={settleAmt} onChange={e => setSettleAmt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowSettle(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-[#2e7d32] text-white rounded hover:bg-[#1b5e20] transition-colors">Confirm Settlement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
