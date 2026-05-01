import { useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import { Search, Plus, Building2, Phone, MapPin, Eye, SquarePen, Trash2, X, ShoppingBag, ChevronLeft, FileText, CircleDot, Package, TrendingUp } from 'lucide-react'

export default function Agencies() {
  const { agencies, addAgency, updateAgency, deleteAgency, products, bills } = useAppContext()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [viewAgency, setViewAgency] = useState(null)
  const [form, setForm] = useState({ name: '', contact: '', address: '', area: '', gstin: '', notes: '' })

  const filtered = agencies.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.area.toLowerCase().includes(search.toLowerCase()) || a.contact.includes(search))

  // Get agency product IDs for sales calculation
  const getAgencyProductIds = (agencyId) => products.filter(p => p.agencyId === agencyId).map(p => p.id)

  // Calculate total sold amount for an agency from actual bills
  const getAgencySoldTotal = (agencyId) => {
    const prodIds = getAgencyProductIds(agencyId)
    if (prodIds.length === 0) return 0
    return bills.filter(b => b.status !== 'void').reduce((total, b) => {
      return total + b.items.filter(item => prodIds.includes(item.id)).reduce((s, item) => s + item.sellingPrice * item.quantity, 0)
    }, 0)
  }

  const totalAgencySales = useMemo(() => agencies.reduce((s, a) => s + getAgencySoldTotal(a.id), 0), [agencies, products, bills])
  const totalAgencyProducts = useMemo(() => products.filter(p => p.agencyId).length, [products])

  const openEdit = (a) => { setEditId(a.id); setForm({ name: a.name, contact: a.contact, address: a.address, area: a.area, gstin: a.gstin, notes: a.notes }); setShowForm(true) }
  const openAdd = () => { setEditId(null); setForm({ name: '', contact: '', address: '', area: '', gstin: '', notes: '' }); setShowForm(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) updateAgency(editId, form)
    else addAgency(form)
    setShowForm(false); setEditId(null)
  }

  // Agency Detail View
  if (viewAgency) {
    const agency = agencies.find(a => a.id === viewAgency.id) || viewAgency
    const agencyProducts = products.filter(p => p.agencyId === agency.id)
    const agencyProductIds = agencyProducts.map(p => p.id)

    // Build per-product selling stats from actual bills
    const productSalesMap = {}
    agencyProducts.forEach(p => { productSalesMap[p.id] = { name: p.name, category: p.category, unit: p.unit, sellingPrice: p.sellingPrice, purchasePrice: p.purchasePrice, stock: p.stock, qtySold: 0, revenue: 0, profit: 0 } })
    bills.filter(b => b.status !== 'void').forEach(b => {
      b.items.forEach(item => {
        if (agencyProductIds.includes(item.id) && productSalesMap[item.id]) {
          productSalesMap[item.id].qtySold += item.quantity
          productSalesMap[item.id].revenue += item.sellingPrice * item.quantity
          productSalesMap[item.id].profit += (item.sellingPrice - (item.purchasePrice || 0)) * item.quantity
        }
      })
    })
    const productSales = Object.values(productSalesMap)
    const totalRevenue = productSales.reduce((s, p) => s + p.revenue, 0)
    const totalProfit = productSales.reduce((s, p) => s + p.profit, 0)
    const totalQtySold = productSales.reduce((s, p) => s + p.qtySold, 0)

    return (
      <div>
        <button onClick={() => setViewAgency(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#002046] mb-4 transition-colors font-medium">
          <ChevronLeft size={16} /> Back to Agencies
        </button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-black text-[#002046] tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#002046] to-[#1b365d] flex items-center justify-center text-white shadow-lg"><Building2 size={24} /></div>
              {agency.name}
            </h2>
            <div className="flex gap-4 mt-2 text-sm text-slate-500">
              {agency.contact && <span className="flex items-center gap-1"><Phone size={13} /> {agency.contact}</span>}
              {agency.area && <span className="flex items-center gap-1"><MapPin size={13} /> {agency.area}</span>}
              {agency.gstin && <span className="flex items-center gap-1"><FileText size={13} /> GSTIN: {agency.gstin}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg border-l-4 border-[#002046] shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Products</p>
            <h3 className="text-2xl font-black text-[#002046]">{agencyProducts.length}</h3>
          </div>
          <div className="bg-white p-5 rounded-lg border-l-4 border-[#775a19] shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-2xl font-black text-[#775a19]">₹{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-5 rounded-lg border-l-4 border-[#2e7d32] shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Profit Earned</p>
            <h3 className="text-2xl font-black text-[#2e7d32]">₹{totalProfit.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-5 rounded-lg border-l-4 border-purple-500 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Qty Sold</p>
            <h3 className="text-2xl font-black text-purple-600">{totalQtySold.toLocaleString()}</h3>
          </div>
        </div>

        {agency.address && <div className="bg-white p-4 rounded-lg shadow-sm mb-6 text-sm text-slate-600"><strong className="text-[#002046]">Address:</strong> {agency.address}</div>}
        {agency.notes && <div className="bg-[#fdf8f0] p-4 rounded-lg shadow-sm mb-6 text-sm text-slate-600 border-l-4 border-[#fed488]"><strong className="text-[#002046]">Notes:</strong> {agency.notes}</div>}

        {/* Product Sales Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-[#002046] flex items-center gap-2"><ShoppingBag size={16} /> Product Sales Details</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold text-right">Selling ₹</th>
                <th className="p-4 font-semibold text-center">Current Stock</th>
                <th className="p-4 font-semibold text-center">Qty Sold</th>
                <th className="p-4 font-semibold text-right">Revenue</th>
                <th className="p-4 font-semibold text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {productSales.map((p, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#002046] text-sm">{p.name}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{p.category}</td>
                  <td className="p-4 text-sm text-right font-medium text-[#002046]">₹{p.sellingPrice}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.stock < 10 ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e8f5e9] text-[#2e7d32]'}`}>{p.stock} {p.unit}</span>
                  </td>
                  <td className="p-4 text-center text-sm font-bold text-[#002046]">{p.qtySold > 0 ? `${p.qtySold} ${p.unit}` : <span className="text-slate-400">—</span>}</td>
                  <td className="p-4 text-right text-sm font-bold text-[#775a19]">{p.revenue > 0 ? `₹${p.revenue.toLocaleString()}` : <span className="text-slate-400">₹0</span>}</td>
                  <td className="p-4 text-right text-sm font-bold text-[#2e7d32]">{p.profit > 0 ? `₹${p.profit.toLocaleString()}` : <span className="text-slate-400">₹0</span>}</td>
                </tr>
              ))}
              {productSales.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-500">No products linked to this agency yet. Add products from Inventory and select this agency as source.</td></tr>}
            </tbody>
          </table>
          {productSales.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between text-sm">
              <span className="text-slate-600 font-bold">Total</span>
              <div className="flex gap-8">
                <span className="font-bold text-[#002046]">Qty: {totalQtySold}</span>
                <span className="font-bold text-[#775a19]">Revenue: ₹{totalRevenue.toLocaleString()}</span>
                <span className="font-bold text-[#2e7d32]">Profit: ₹{totalProfit.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main Agency List View
  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#002046] tracking-tight">Agencies</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your agency partners and track their product sales.</p>
        </div>
        <button onClick={openAdd} className="bg-[#002046] text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-[#1b365d] transition-colors shadow-lg btn-pop">
          <Plus size={18} /> New Agency
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Agencies</p>
          <h3 className="text-2xl font-black text-[#002046]">{agencies.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#775a19] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Sales</p>
          <h3 className="text-2xl font-black text-[#775a19]">₹{totalAgencySales.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#2e7d32] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Agency Products</p>
          <h3 className="text-2xl font-black text-[#2e7d32]">{totalAgencyProducts}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-purple-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active</p>
          <h3 className="text-2xl font-black text-purple-600">{agencies.filter(a => a.status === 'active').length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search agencies by name, area, or contact..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-[#002046]" />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
              <th className="p-4 font-semibold">Agency</th>
              <th className="p-4 font-semibold text-center">Contact</th>
              <th className="p-4 font-semibold text-center">Area</th>
              <th className="p-4 font-semibold text-center">Products</th>
              <th className="p-4 font-semibold text-right">Total Sales</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-[#002046] to-[#1b365d] flex items-center justify-center text-white flex-shrink-0 shadow"><Building2 size={18} /></div>
                    <div>
                      <p className="font-bold text-[#002046]">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.gstin ? `GSTIN: ${a.gstin}` : `ID: AGN-${a.id.substring(a.id.length - 4)}`}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center text-sm font-medium text-slate-600">
                  {a.contact ? <span className="flex items-center justify-center gap-1"><Phone size={14} className="text-slate-400" /> {a.contact}</span> : '—'}
                </td>
                <td className="p-4 text-center text-sm text-slate-600">
                  {a.area ? <span className="flex items-center justify-center gap-1"><MapPin size={14} className="text-slate-400" /> {a.area}</span> : '—'}
                </td>
                <td className="p-4 text-center">
                  <span className="px-2 py-1 rounded text-xs font-bold bg-[#f0eee7] text-[#002046]">{products.filter(p => p.agencyId === a.id).length}</span>
                </td>
                <td className="p-4 text-right font-bold text-[#775a19]">₹{getAgencySoldTotal(a.id).toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1 ${a.status === 'active' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-slate-100 text-slate-500'}`}>
                    <CircleDot size={10} /> {a.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setViewAgency(a)} className="px-3 py-1 bg-[#f0eee7] text-[#002046] rounded text-xs font-bold hover:bg-[#e0ddd5] transition-colors inline-flex items-center gap-1"><Eye size={12} /> View</button>
                    <button onClick={() => openEdit(a)} className="p-2 text-slate-400 hover:text-[#002046] transition-colors"><SquarePen size={16} /></button>
                    <button onClick={() => { if (window.confirm(`Delete agency "${a.name}"?`)) deleteAgency(a.id) }} className="p-2 text-slate-400 hover:text-[#ba1a1a] transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-500">{agencies.length === 0 ? 'No agencies added yet. Click "New Agency" to get started.' : 'No agencies match your search.'}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Agency Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden modal-enter">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#002046] text-lg">{editId ? 'Edit Agency' : 'Add New Agency'}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Agency Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Contact Number</label>
                  <input type="tel" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Area / City</label>
                  <input type="text" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Address</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" placeholder="Optional" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">GSTIN</label>
                <input type="text" value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" placeholder="Optional" />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046] resize-none" rows={2} placeholder="Optional" />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-[#002046] text-white rounded hover:bg-[#1b365d] transition-colors">{editId ? 'Update' : 'Add Agency'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
