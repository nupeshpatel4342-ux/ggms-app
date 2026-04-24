import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Search, Plus, Package, SquarePen, Trash2, TriangleAlert, X } from 'lucide-react'

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory } = useAppContext()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [form, setForm] = useState({ name: '', category: categories[0] || 'Grocery', purchasePrice: '', sellingPrice: '', stock: '', unit: 'kg', barcode: '' })

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))

  const openModal = (product = null) => {
    if (product) {
      setEditId(product.id)
      setForm(product)
    } else {
      setEditId(null)
      setForm({ name: '', category: categories[0] || 'Grocery', purchasePrice: '', sellingPrice: '', stock: '', unit: 'kg', barcode: '' })
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

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#002046] tracking-tight">Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage products, stock levels, and pricing.</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#002046] text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-[#1b365d] transition-colors shadow-lg btn-pop">
          <Plus size={18} /> New Product
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Products</p>
          <h3 className="text-3xl font-black text-[#002046]">{products.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#ba1a1a] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Low Stock Alerts</p>
          <h3 className="text-3xl font-black text-[#ba1a1a]">{products.filter(p => p.stock < 10).length}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#775a19] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Inventory Value</p>
          <h3 className="text-3xl font-black text-[#002046]">₹{products.reduce((s, p) => s + p.purchasePrice * p.stock, 0).toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search products or categories..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-[#002046] focus:ring-1 focus:ring-[#002046]" />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
              <th className="p-4 font-semibold">Product Name</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold text-right">Selling Price</th>
              <th className="p-4 font-semibold text-center">Stock</th>
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
                <td className="p-4 text-right font-bold text-[#002046]">₹{p.sellingPrice?.toFixed(2)}</td>
                <td className="p-4 text-center">
                  {p.stock < 10 ? (
                    <span className="inline-flex items-center gap-1 bg-[#ffdad6] text-[#ba1a1a] px-2 py-1 rounded text-xs font-bold">
                      <TriangleAlert size={12} /> {p.stock} {p.unit}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#e8f5e9] text-[#2e7d32] px-2 py-1 rounded text-xs font-bold">{p.stock} {p.unit}</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal(p)} className="p-2 text-slate-400 hover:text-[#002046] transition-colors"><SquarePen size={18} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-400 hover:text-[#ba1a1a] transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No products found.</td></tr>}
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
                  <input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]">
                    <option>kg</option><option>pcs</option><option>liter</option><option>gm</option><option>dozen</option><option>packet</option>
                  </select>
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
    </div>
  )
}
