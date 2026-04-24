import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Search, Plus, Package, SquarePen, Trash2, TriangleAlert, X, ArrowUpDown, Clock } from 'lucide-react'

function StockAdjustModal({ product, onSubmit, onClose }) {
  const [type, setType] = useState('remove')
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden modal-enter">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-[#002046] text-lg">Stock Adjustment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit({ productId: product.id, productName: product.name, type, quantity: parseFloat(qty) || 0, reason }); onClose(); }} className="p-6">
          <p className="text-sm text-slate-600 mb-4">Product: <strong className="text-[#002046]">{product.name}</strong> — Current Stock: <strong>{product.stock} {product.unit}</strong></p>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Adjustment Type</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setType('remove')} className={`flex-1 py-2 rounded text-sm font-bold border transition-colors ${type === 'remove' ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]' : 'bg-white text-slate-600 border-slate-300'}`}>Remove (−)</button>
              <button type="button" onClick={() => setType('add')} className={`flex-1 py-2 rounded text-sm font-bold border transition-colors ${type === 'add' ? 'bg-[#2e7d32] text-white border-[#2e7d32]' : 'bg-white text-slate-600 border-slate-300'}`}>Add (+)</button>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Quantity ({product.unit})</label>
            <input required type="number" min="0.01" step="0.01" value={qty} onChange={e => setQty(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]">
              <option value="">Select reason...</option>
              <option>Damaged / Broken</option>
              <option>Expired</option>
              <option>Theft / Missing</option>
              <option>Correction</option>
              <option>Personal Use</option>
              <option>Return from Customer</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 font-semibold bg-[#002046] text-white rounded hover:bg-[#1b365d] transition-colors">Adjust Stock</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory, addStockAdjustment, profile } = useAppContext()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [adjustProduct, setAdjustProduct] = useState(null)
  const [catFilter, setCatFilter] = useState('All')
  const [form, setForm] = useState({ name: '', category: categories[0] || 'Grocery', purchasePrice: '', sellingPrice: '', stock: '', unit: 'kg', barcode: '', expiryDate: '' })

  const lowStockThreshold = profile?.lowStockAlert || 10
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search))
    const matchesCat = catFilter === 'All' || p.category === catFilter
    return matchesSearch && matchesCat
  })

  const expiringProducts = products.filter(p => {
    if (!p.expiryDate) return false
    const diff = (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff > 0
  })

  const expiredProducts = products.filter(p => {
    if (!p.expiryDate) return false
    return new Date(p.expiryDate) < new Date()
  })

  const openModal = (product = null) => {
    if (product) {
      setEditId(product.id)
      setForm({ ...product })
    } else {
      setEditId(null)
      setForm({ name: '', category: categories[0] || 'Grocery', purchasePrice: '', sellingPrice: '', stock: '', unit: 'kg', barcode: '', expiryDate: '' })
    }
    setShowNewCat(false)
    setNewCatName('')
    setShowModal(true)
  }

  const handleAddCat = () => {
    if (newCatName.trim()) {
      addCategory(newCatName.trim())
      setForm(f => ({ ...f, category: newCatName.trim() }))
      setNewCatName('')
      setShowNewCat(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) updateProduct(editId, form)
    else addProduct(form)
    setShowModal(false)
  }

  const getExpiryBadge = (expiryDate) => {
    if (!expiryDate) return null
    const diff = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold"><Clock size={10} /> EXPIRED</span>
    if (diff <= 30) return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold"><Clock size={10} /> {Math.ceil(diff)}d left</span>
    return <span className="text-[10px] text-slate-400">{new Date(expiryDate).toLocaleDateString()}</span>
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#002046] tracking-tight">Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage products, stock levels, pricing and expiry.</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#002046] text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-[#1b365d] transition-colors shadow-lg btn-pop">
          <Plus size={18} /> New Product
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Products</p>
          <h3 className="text-3xl font-black text-[#002046]">{products.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#ba1a1a] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Low Stock Alerts</p>
          <h3 className="text-3xl font-black text-[#ba1a1a]">{products.filter(p => p.stock < lowStockThreshold).length}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#775a19] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Inventory Value</p>
          <h3 className="text-3xl font-black text-[#002046]">₹{products.reduce((s, p) => s + p.purchasePrice * p.stock, 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-amber-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Expiring / Expired</p>
          <h3 className="text-3xl font-black text-amber-600">{expiringProducts.length + expiredProducts.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center bg-slate-50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search products, categories or barcode..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-[#002046] focus:ring-1 focus:ring-[#002046]" />
          </div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setCatFilter('All')} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${catFilter === 'All' ? 'bg-[#002046] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'}`}>All</button>
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${catFilter === c ? 'bg-[#002046] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'}`}>{c}</button>
            ))}
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
              <th className="p-4 font-semibold">Product Name</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold text-right">Purchase ₹</th>
              <th className="p-4 font-semibold text-right">Selling ₹</th>
              <th className="p-4 font-semibold text-center">Stock</th>
              <th className="p-4 font-semibold text-center">Expiry</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#f0eee7] flex items-center justify-center text-slate-500 flex-shrink-0"><Package size={20} /></div>
                    <div>
                      <p className="font-bold text-[#002046]">{p.name}</p>
                      <p className="text-xs text-slate-500">Barcode: {p.barcode || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">{p.category}</td>
                <td className="p-4 text-right text-sm text-slate-500">₹{p.purchasePrice?.toFixed(2)}</td>
                <td className="p-4 text-right font-bold text-[#002046]">₹{p.sellingPrice?.toFixed(2)}</td>
                <td className="p-4 text-center">
                  {p.stock < lowStockThreshold ? (
                    <span className="inline-flex items-center gap-1 bg-[#ffdad6] text-[#ba1a1a] px-2 py-1 rounded text-xs font-bold">
                      <TriangleAlert size={12} /> {p.stock} {p.unit}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#e8f5e9] text-[#2e7d32] px-2 py-1 rounded text-xs font-bold">{p.stock} {p.unit}</span>
                  )}
                </td>
                <td className="p-4 text-center">{getExpiryBadge(p.expiryDate)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setAdjustProduct(p)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Stock Adjust"><ArrowUpDown size={16} /></button>
                    <button onClick={() => openModal(p)} className="p-2 text-slate-400 hover:text-[#002046] transition-colors" title="Edit"><SquarePen size={16} /></button>
                    <button onClick={() => { if (window.confirm(`Delete "${p.name}"?`)) deleteProduct(p.id) }} className="p-2 text-slate-400 hover:text-[#ba1a1a] transition-colors" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-500">No products found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden modal-enter">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#002046] text-lg">{editId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Product Name *</label>
                  <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Category</label>
                  {showNewCat ? (
                    <div className="flex gap-2">
                      <input autoFocus type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCat())}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046] text-sm" placeholder="Category name" />
                      <button type="button" onClick={handleAddCat} className="px-3 py-2 bg-[#002046] text-white rounded text-sm font-bold">Add</button>
                      <button type="button" onClick={() => setShowNewCat(false)} className="px-2 text-slate-400"><X size={15} /></button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]">
                        {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowNewCat(true)} className="px-2 py-2 text-[#002046] hover:bg-slate-100 rounded"><Plus size={18} /></button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Barcode</label>
                  <input type="text" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Purchase Price *</label>
                  <input required type="number" min="0" step="0.01" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Selling Price *</label>
                  <input required type="number" min="0" step="0.01" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Stock *</label>
                  <input required type="number" min="0" step="0.01" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]">
                    <option>kg</option><option>pcs</option><option>liter</option><option>gm</option><option>dozen</option><option>packet</option><option>box</option><option>bottle</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-[#002046] text-white rounded hover:bg-[#1b365d] transition-colors">{editId ? 'Update' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {adjustProduct && <StockAdjustModal product={adjustProduct} onSubmit={addStockAdjustment} onClose={() => setAdjustProduct(null)} />}
    </div>
  )
}
