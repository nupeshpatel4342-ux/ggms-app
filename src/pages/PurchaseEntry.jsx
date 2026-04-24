import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Search, Trash2 } from 'lucide-react'

export default function PurchaseEntry() {
  const { suppliers, products, processPurchase } = useAppContext()
  const [supplierId, setSupplierId] = useState('')
  const [items, setItems] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [paidAmount, setPaidAmount] = useState('')

  const filteredProducts = productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())) : products

  const addItem = (product) => {
    setItems(prev => prev.find(i => i.productId === product.id) ? prev : [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.purchasePrice }])
    setProductSearch('')
  }

  const updateItem = (productId, field, value) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, [field]: parseFloat(value) || 0 } : i))
  }

  const removeItem = (productId) => setItems(prev => prev.filter(i => i.productId !== productId))

  const total = items.reduce((s, i) => s + i.quantity * i.price, 0)
  const pending = total - parseFloat(paidAmount || 0)

  const handleSubmit = () => {
    if (!supplierId) return alert('Please select a supplier!')
    if (items.length === 0) return alert('Please add at least one product!')
    processPurchase({ supplierId, items, total, paidAmount: parseFloat(paidAmount || 0), pendingAmount: Math.max(0, pending) })
    setItems([])
    setSupplierId('')
    setPaidAmount('')
  }

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#002046] tracking-tight">Purchase Entry</h2>
          <p className="text-slate-500 text-sm mt-1">Record new stock intake and update inventory automatically.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-[#002046] mb-4">Supplier Details</h3>
          <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]">
            <option value="">Select Supplier...</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.contact})</option>)}
          </select>
        </div>

        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-[#002046] mb-4">Add Products</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search products to add..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
          </div>
          {productSearch && (
            <div className="bg-slate-50 rounded border border-slate-200 max-h-40 overflow-y-auto mb-4">
              {filteredProducts.slice(0, 8).map(p => (
                <button key={p.id} onClick={() => addItem(p)}
                  className="w-full flex justify-between items-center px-4 py-2.5 hover:bg-white transition-colors text-left border-b border-slate-100 last:border-0">
                  <span className="font-semibold text-[#002046] text-sm">{p.name}</span>
                  <span className="text-xs text-slate-500">₹{p.purchasePrice} / {p.unit}</span>
                </button>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-2 font-semibold">Product</th>
                  <th className="py-2 font-semibold text-center">Quantity</th>
                  <th className="py-2 font-semibold text-center">Price/Unit</th>
                  <th className="py-2 font-semibold text-right">Subtotal</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.productId} className="border-b border-slate-100">
                    <td className="py-3 font-bold text-[#002046] text-sm">{item.name}</td>
                    <td className="py-3 text-center">
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.productId, 'quantity', e.target.value)}
                        className="w-20 text-center px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(item.productId, 'price', e.target.value)}
                        className="w-24 text-center px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                    </td>
                    <td className="py-3 text-right font-bold text-[#002046]">₹{(item.quantity * item.price).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => removeItem(item.productId)} className="text-slate-400 hover:text-[#ba1a1a]"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 bg-slate-50">
            <div className="flex justify-between items-center max-w-md ml-auto">
              <div>
                <p className="text-sm text-slate-600">Total: <span className="font-black text-[#002046] text-xl">₹{total.toFixed(2)}</span></p>
                <div className="mt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Paid Amount (₹)</label>
                  <input type="number" min="0" step="0.01" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
                {pending > 0 && <p className="text-sm text-[#ba1a1a] font-semibold mt-2">Pending: ₹{pending.toFixed(2)}</p>}
              </div>
              <button onClick={handleSubmit}
                className="bg-[#002046] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1b365d] transition-colors btn-pop">
                Record Purchase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
