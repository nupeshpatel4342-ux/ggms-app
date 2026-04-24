import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Search, Plus, Truck, Phone, Wallet, SquarePen, Trash2, X } from 'lucide-react'

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, settleSupplierPayment } = useAppContext()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showSettle, setShowSettle] = useState(false)
  const [settleSupp, setSettleSupp] = useState(null)
  const [settleAmt, setSettleAmt] = useState('')
  const [form, setForm] = useState({ name: '', contact: '', address: '' })

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.contact.includes(search))

  const openEdit = (s) => {
    setEditId(s.id)
    setForm({ name: s.name, contact: s.contact, address: s.address || '' })
    setShowAdd(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) { updateSupplier(editId, form); }
    else { addSupplier(form); }
    setForm({ name: '', contact: '', address: '' })
    setEditId(null)
    setShowAdd(false)
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#002046] tracking-tight">Suppliers</h2>
          <p className="text-slate-500 text-sm mt-1">Manage supplier contacts and pending payments.</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: '', contact: '', address: '' }); setShowAdd(true) }} className="bg-[#002046] text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-[#1b365d] transition-colors shadow-lg btn-pop">
          <Plus size={18} /> New Supplier
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Suppliers</p>
          <h3 className="text-3xl font-black text-[#002046]">{suppliers.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#ba1a1a] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pending Payments</p>
          <h3 className="text-3xl font-black text-[#ba1a1a]">₹{suppliers.reduce((s, sup) => s + sup.pendingPayment, 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#2e7d32] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Cleared</p>
          <h3 className="text-3xl font-black text-[#2e7d32]">{suppliers.filter(s => s.pendingPayment === 0).length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search suppliers by name or contact..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-[#002046]" />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
              <th className="p-4 font-semibold">Supplier</th>
              <th className="p-4 font-semibold text-center">Contact</th>
              <th className="p-4 font-semibold text-right">Pending Payment</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#f0eee7] flex items-center justify-center text-[#002046] flex-shrink-0"><Truck size={20} /></div>
                    <div>
                      <p className="font-bold text-[#002046]">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.address || `ID: SUP-${s.id.substring(s.id.length - 4)}`}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center text-sm font-medium text-slate-600">
                  <div className="flex items-center justify-center gap-2"><Phone size={14} className="text-slate-400" /> {s.contact}</div>
                </td>
                <td className="p-4 text-right">
                  {s.pendingPayment > 0 ? <span className="font-bold text-[#ba1a1a]">₹{s.pendingPayment.toLocaleString()}</span> : <span className="font-bold text-[#2e7d32]">₹0</span>}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    {s.pendingPayment > 0 && (
                      <button onClick={() => { setSettleSupp(s); setShowSettle(true) }}
                        className="px-3 py-1 bg-[#e8f5e9] text-[#2e7d32] rounded text-xs font-bold hover:bg-[#c8e6c9] transition-colors inline-flex items-center gap-1">
                        <Wallet size={12} /> Pay
                      </button>
                    )}
                    <button onClick={() => openEdit(s)} className="p-2 text-slate-400 hover:text-[#002046] transition-colors"><SquarePen size={16} /></button>
                    <button onClick={() => { if (window.confirm(`Delete supplier "${s.name}"?`)) deleteSupplier(s.id) }} className="p-2 text-slate-400 hover:text-[#ba1a1a] transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No suppliers found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden modal-enter">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#002046] text-lg">{editId ? 'Edit Supplier' : 'Add New Supplier'}</h3>
              <button onClick={() => { setShowAdd(false); setEditId(null) }} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Supplier Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Contact Number *</label>
                <input required type="tel" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Address</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" placeholder="Optional" />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => { setShowAdd(false); setEditId(null) }} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-[#002046] text-white rounded hover:bg-[#1b365d] transition-colors">{editId ? 'Update' : 'Add Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Payment Modal */}
      {showSettle && settleSupp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden modal-enter">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#002046] text-lg">Settle Payment</h3>
              <button onClick={() => setShowSettle(false)} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); settleSupplierPayment(settleSupp.id, parseFloat(settleAmt)); setShowSettle(false); setSettleAmt('') }} className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Pending payment to <strong className="text-[#002046]">{settleSupp.name}</strong> is <strong className="text-[#ba1a1a]">₹{settleSupp.pendingPayment.toLocaleString()}</strong>.
              </p>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Amount Paid (₹)</label>
                <input required type="number" step="0.01" max={settleSupp.pendingPayment} value={settleAmt} onChange={e => setSettleAmt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowSettle(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-[#2e7d32] text-white rounded hover:bg-[#1b5e20] transition-colors">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
