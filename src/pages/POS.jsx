import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { Search, Plus, X, CircleCheckBig, Printer, UserPlus, Phone, ShoppingCart, Download, MessageCircle, Package } from 'lucide-react'
import { printBillPDF, shareBillWhatsApp, downloadBillPDF } from '../utils/billPdf'

function QuickAddCustomerModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', mobile: '' })
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden modal-enter">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-[#002046] text-lg">Quick Add Customer</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onAdd(form); }} className="p-6">
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Name *</label>
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Mobile *</label>
            <input required type="tel" pattern="[0-9]{10}" placeholder="10 digit number" value={form.mobile}
              onChange={e => setForm({ ...form, mobile: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 font-semibold bg-[#002046] text-white rounded hover:bg-[#1b365d] transition-colors">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BillPrintModal({ bill, customer, profile, onClose }) {
  const totalQty = bill.items.reduce((s, i) => s + i.quantity, 0)
  const rawTotal = bill.subtotal + (bill.tax || 0) - (bill.discount || 0)
  const roundOff = (Math.round(rawTotal) - rawTotal).toFixed(2)
  const halfTax = bill.tax > 0 ? (bill.tax / 2).toFixed(2) : null

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 p-4">
      <div className="w-full max-w-[80mm] flex justify-end mb-2">
        <button onClick={onClose} className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors"><X size={20} /></button>
      </div>

      {/* HTML Preview - Professional Kirana Receipt */}
      <div className="bg-white shadow-2xl overflow-y-auto max-h-[60vh] flex-shrink-0 relative w-[80mm]">
        <div id="print-area" className="w-full px-3 py-4 bg-white text-black font-mono text-[11px] leading-tight">
          {/* Header */}
          <div className="text-center mb-2">
            <p className="text-[8px] font-bold text-gray-500 tracking-[3px] uppercase">Tax Invoice</p>
            <h3 className="text-[18px] font-black uppercase tracking-tight mt-1 mb-1">{profile?.shopName || 'GGM&S Retail'}</h3>
            {profile?.address && <p className="text-[9px] text-gray-600 leading-snug mb-0.5">{profile.address}</p>}
            {profile?.mobile && <p className="text-[10px] font-medium">Ph: {profile.mobile}</p>}
            {profile?.gstin && <p className="text-[8px] font-bold text-gray-700 mt-0.5">GSTIN: {profile.gstin}</p>}
          </div>

          {/* Double line */}
          <div className="border-t-2 border-b-2 border-black my-2 h-[2px]" />

          {/* Bill Info */}
          <div className="py-1.5 space-y-0.5 text-[10px]">
            <div className="flex justify-between"><span>Bill No:</span><span className="font-bold">{bill.id}</span></div>
            <div className="flex justify-between"><span>Date:</span><span>{new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
            <div className="flex justify-between"><span>Time:</span><span>{new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
          </div>

          {customer && (
            <div className="border-t border-dashed border-gray-400 py-1.5 space-y-0.5 text-[10px]">
              <div className="flex justify-between"><span>Customer:</span><span className="font-bold">{customer.name}</span></div>
              {customer.mobile && <div className="flex justify-between"><span>Mobile:</span><span>{customer.mobile}</span></div>}
            </div>
          )}

          {/* Items Header */}
          <div className="border-t border-b border-black py-1 mt-1">
            <div className="flex text-[8px] font-bold uppercase tracking-wide">
              <span className="w-[8%]">SR</span>
              <span className="flex-1">ITEM NAME</span>
              <span className="w-[22%] text-right">AMOUNT</span>
            </div>
          </div>

          {/* Items */}
          <div className="py-1">
            {bill.items.map((item, i) => {
              const qtyStr = Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)
              return (
                <div key={i} className="mb-2">
                  <div className="flex text-[10px]">
                    <span className="w-[8%] text-gray-600">{i + 1}</span>
                    <span className="flex-1 font-semibold">{item.name}</span>
                    <span className="w-[22%] text-right font-bold">₹{(item.quantity * item.sellingPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex text-[8px] text-gray-500 ml-[8%]">
                    <span>{qtyStr} {item.unit || 'pcs'} × ₹{item.sellingPrice.toFixed(2)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Double line */}
          <div className="border-t-2 border-b-2 border-black my-1 h-[2px]" />

          {/* Item & Qty count */}
          <p className="text-[8px] text-gray-500 py-1">Total Items: {bill.items.length} &nbsp;|&nbsp; Total Qty: {Number.isInteger(totalQty) ? totalQty : totalQty.toFixed(2)}</p>

          {/* Totals */}
          <div className="py-1 space-y-1 text-[10px]">
            <div className="flex justify-between font-semibold"><span>Subtotal</span><span>₹{bill.subtotal.toFixed(2)}</span></div>
            {halfTax && (
              <>
                <div className="flex justify-between text-[9px] text-gray-600"><span>CGST (2.5%)</span><span>₹{halfTax}</span></div>
                <div className="flex justify-between text-[9px] text-gray-600"><span>SGST (2.5%)</span><span>₹{halfTax}</span></div>
              </>
            )}
            {bill.discount > 0 && (
              <div className="flex justify-between text-[9px] text-red-600"><span>Discount</span><span>-₹{bill.discount.toFixed(2)}</span></div>
            )}
            {Math.abs(parseFloat(roundOff)) >= 0.01 && (
              <div className="flex justify-between text-[8px] text-gray-500"><span>Round Off</span><span>₹{roundOff}</span></div>
            )}
          </div>

          {/* Grand Total */}
          <div className="border-t-2 border-b-2 border-black py-2 my-1">
            <div className="flex justify-between font-black text-[15px]">
              <span>GRAND TOTAL</span>
              <span>₹{bill.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="text-center py-2 font-bold text-[11px]">
            Paid by: {bill.paymentMode.toUpperCase()}
          </div>

          {/* Savings */}
          {bill.discount > 0 && (
            <div className="text-center py-1 border-t border-dashed border-gray-400">
              <p className="text-[9px] font-bold text-green-700">★ You Saved ₹{bill.discount.toFixed(2)} on this bill! ★</p>
            </div>
          )}

          {/* UPI */}
          {profile?.upiId && bill.paymentMode !== 'Cash' && (
            <div className="text-center py-1.5 border-t border-dashed border-gray-400">
              <p className="text-[8px] text-gray-500">Pay via UPI:</p>
              <p className="text-[9px] font-bold">{profile.upiId}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-dashed border-gray-400 mt-1 pt-2 text-center">
            <p className="font-bold text-[10px]">Thank You! Visit Again!</p>
            <p className="text-[7px] text-gray-500 mt-1.5 leading-relaxed">Goods once sold will not be taken back.<br/>Subject to local jurisdiction. E. & O.E.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-5 w-full max-w-[80mm]">
        <button onClick={() => shareBillWhatsApp(bill, customer, profile)} className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebd5a] transition-colors shadow-lg font-bold text-sm">
          <MessageCircle size={18} /> WhatsApp
        </button>
        <button onClick={() => printBillPDF(bill, customer, profile)} className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#002046] text-white rounded-lg hover:bg-[#1b365d] transition-colors shadow-lg font-bold text-sm">
          <Printer size={18} /> Print
        </button>
        <button onClick={() => downloadBillPDF(bill, customer, profile)} className="flex justify-center items-center gap-2 py-3 px-4 bg-[#775a19] text-white rounded-lg hover:bg-[#5a4213] transition-colors shadow-lg font-bold text-sm">
          <Download size={18} />
        </button>
      </div>
    </div>
  )
}

export default function POS() {
  const { products, customers, addCustomer, processBill, profile, agencies } = useAppContext()
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [custSearch, setCustSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustDropdown, setShowCustDropdown] = useState(false)
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [discount, setDiscount] = useState(0)
  const [showAddCust, setShowAddCust] = useState(false)
  const [showBillPrint, setShowBillPrint] = useState(false)
  const [lastBill, setLastBill] = useState(null)
  const [billingMode, setBillingMode] = useState('retail')
  const [editBillData, setEditBillData] = useState(null)
  const searchRef = useRef(null)
  const custRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'F1') { e.preventDefault(); searchRef.current?.focus() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const savedEdit = localStorage.getItem('ggms_edit_bill')
    if (savedEdit) {
      try {
        const parsed = JSON.parse(savedEdit)
        setEditBillData(parsed)
        setBillingMode(parsed.billType === 'wholesale' ? 'wholesale' : 'retail')
        setCart(parsed.items || [])
        setPaymentMode(parsed.paymentMode || 'Cash')
        setDiscount(parsed.discount || 0)
        if (parsed.customerId) {
          const cust = customers.find(c => c.id === parsed.customerId)
          if (cust) {
            setSelectedCustomer(cust)
            setCustSearch(cust.name)
          }
        }
      } catch (e) {
        console.error('Failed to load edit bill:', e)
      }
      localStorage.removeItem('ggms_edit_bill')
    }
  }, [customers])

  const availableProducts = billingMode === 'wholesale'
    ? products.filter(p => p.agencyId)
    : products

  const filteredProducts = search
    ? availableProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search))
    : availableProducts

  const availableCustomers = customers.filter(c => c.type === billingMode)

  const matchedCustomers = custSearch
    ? availableCustomers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.mobile.includes(custSearch))
    : []

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.findIndex(c => c.id === product.id)
      if (existing !== -1) {
        const updated = [...prev]
        const step = ['kg', 'liter', 'gm'].includes(product.unit) ? 0.5 : 1
        if (updated[existing].quantity + step <= product.stock) updated[existing].quantity = parseFloat((updated[existing].quantity + step).toFixed(3))
        return updated
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c
      const product = products.find(p => p.id === id)
      const step = ['kg', 'liter', 'gm'].includes(c.unit) ? 0.5 : 1
      const newQty = parseFloat((c.quantity + delta * step).toFixed(3))
      if (newQty < 0.001 || (product && newQty > product.stock)) return c
      return { ...c, quantity: newQty }
    }).filter(c => c.quantity > 0))
  }

  const setDirectQty = (id, val) => {
    const qty = parseFloat(val)
    if (isNaN(qty) || qty < 0) return
    const product = products.find(p => p.id === id)
    if (product && qty > product.stock) return
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: qty } : c).filter(c => c.quantity > 0))
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id))

  const subtotal = cart.reduce((s, c) => s + c.sellingPrice * c.quantity, 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax - parseFloat(discount || 0)

  const handleCheckout = () => {
    if (cart.length === 0) return alert('Cart is empty!')
    if (paymentMode === 'Udhar' && !selectedCustomer) return alert('Please select a customer for Udhar!')

    const bill = processBill({
      items: cart,
      customerId: selectedCustomer?.id || null,
      paymentMode,
      billType: billingMode,
      subtotal,
      tax,
      discount: parseFloat(discount || 0),
      total,
      udharAmount: paymentMode === 'Udhar' ? total : 0,
    }, editBillData?.id, editBillData?.date)

    setLastBill({ ...bill, shopName: profile?.shopName })
    setShowBillPrint(true)
    setCart([])
    setSelectedCustomer(null)
    setCustSearch('')
    setPaymentMode('Cash')
    setDiscount(0)
    setEditBillData(null)
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Left side - Cart */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-[#002046] tracking-tight">
              {editBillData ? `Editing Bill: ${editBillData.id}` : 'Billing / POS'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {editBillData ? 'Modify the contents of this bill and checkout to save changes.' : 'Create bills and process transactions.'}
            </p>
          </div>
          <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => { setBillingMode('retail'); setCart([]); setSelectedCustomer(null); setCustSearch(''); setEditBillData(null) }}
              className={`px-5 py-2.5 text-sm font-bold transition-colors flex items-center gap-2 ${billingMode === 'retail' ? 'bg-[#002046] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <ShoppingCart size={16} /> Retail
            </button>
            <button onClick={() => { setBillingMode('wholesale'); setCart([]); setSelectedCustomer(null); setCustSearch(''); setEditBillData(null) }}
              className={`px-5 py-2.5 text-sm font-bold transition-colors flex items-center gap-2 ${billingMode === 'wholesale' ? 'bg-[#775a19] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Package size={16} /> Wholesale
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-[#002046]">{billingMode === 'wholesale' ? '📦 Wholesale Bill' : '🛒 Retail Bill'}</h3>
            {billingMode === 'wholesale' && <span className="text-xs font-bold text-[#775a19] bg-[#ffddb9] px-2 py-1 rounded">WHOLESALE</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShoppingCart size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Cart is empty — search or tap products to add</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-2 font-semibold">Item</th>
                    <th className="py-2 font-semibold text-center">Qty</th>
                    <th className="py-2 font-semibold text-right">Amount</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3">
                        <p className="font-bold text-[#002046] text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500">₹{item.sellingPrice} / {item.unit}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded bg-slate-200 text-[#002046] font-bold hover:bg-slate-300 transition-colors">−</button>
                          <input type="number" min="0.001" step={['kg','liter','gm'].includes(item.unit) ? '0.5' : '1'} value={item.quantity}
                            onChange={e => setDirectQty(item.id, e.target.value)}
                            className="w-14 text-center font-bold text-[#002046] border border-slate-300 rounded py-1 text-sm focus:outline-none focus:border-[#002046]" />
                          <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded bg-slate-200 text-[#002046] font-bold hover:bg-slate-300 transition-colors">+</button>
                        </div>
                      </td>
                      <td className="py-3 text-right font-bold text-[#002046]">₹{(item.sellingPrice * item.quantity).toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-[#ba1a1a] transition-colors"><X size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Customer & Payment Section */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            {/* Customer Search */}
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Customer</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input ref={custRef} type="text" placeholder="Search by name or mobile..."
                    value={custSearch}
                    onChange={e => { setCustSearch(e.target.value); setShowCustDropdown(true); if (!e.target.value) setSelectedCustomer(null) }}
                    onFocus={() => setShowCustDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCustDropdown(false), 200)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046] text-sm" />
                  {showCustDropdown && custSearch && (
                    <div className="absolute top-full left-0 right-0 z-20 bg-white border border-slate-200 rounded shadow-xl mt-1 max-h-44 overflow-y-auto animate-fade-in">
                      {matchedCustomers.length === 0 ? (
                        <div className="p-3 text-slate-500 text-sm text-center">No customer found</div>
                      ) : matchedCustomers.slice(0, 6).map(c => (
                        <button key={c.id}
                          onMouseDown={() => { setSelectedCustomer(c); setCustSearch(c.name); setShowCustDropdown(false) }}
                          className="w-full flex justify-between items-center px-4 py-2.5 hover:bg-slate-50 transition-colors text-left">
                          <span className="font-semibold text-[#002046] text-sm">{c.name}</span>
                          <span className="text-xs text-slate-400">{c.mobile}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setShowAddCust(true)} className="flex items-center gap-1 px-3 py-2 bg-[#002046] text-white rounded text-xs font-bold hover:bg-[#1b365d] transition-colors btn-pop whitespace-nowrap">
                  <Plus size={14} /> New
                </button>
              </div>
              {selectedCustomer && (
                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded animate-fade-in">
                  <CircleCheckBig size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-emerald-700">{selectedCustomer.name}</span>
                  <span className="text-xs text-emerald-500">{selectedCustomer.mobile}</span>
                  <button onClick={() => { setSelectedCustomer(null); setCustSearch('') }} className="ml-auto text-slate-400 hover:text-red-500"><X size={13} /></button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Payment Mode</p>
                <div className="flex gap-2">
                  {['Cash', 'UPI', 'Udhar'].map(m => (
                    <button key={m} onClick={() => setPaymentMode(m)}
                      className={`flex-1 py-2 rounded text-sm font-bold border transition-colors ${
                        paymentMode === m ? 'bg-[#002046] text-white border-[#002046]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}>{m}</button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Discount (₹)</label>
                  <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-slate-600 mb-1"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-slate-600 mb-1"><span>Tax (GST)</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-[#ba1a1a] mb-2 font-semibold"><span>Discount</span><span>-₹{parseFloat(discount || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-2xl font-black text-[#002046] border-t border-slate-300 pt-2 mb-4"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                <button onClick={handleCheckout} disabled={cart.length === 0}
                  className="w-full bg-[#2e7d32] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#1b5e20] transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Printer size={20} /> Checkout & Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Product search */}
      <div className="w-96 flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input ref={searchRef} type="text" placeholder="Search product or scan barcode (F1)"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-300 focus:outline-none focus:border-[#002046] text-[#002046] font-bold placeholder:font-normal" />
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
          <h4 className="font-bold text-[#002046] mb-4">Products</h4>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.slice(0, 20).map(p => (
              <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0}
                className={`p-3 rounded border text-left flex flex-col justify-between h-24 hover:border-[#002046] transition-colors ${
                  p.stock <= 0 ? 'opacity-50 border-slate-200 cursor-not-allowed' : 'border-slate-200 cursor-pointer bg-slate-50 hover:bg-[#f6f3ec]'
                }`}>
                <div>
                  <p className="text-sm font-bold text-[#002046] line-clamp-2 leading-tight">{p.name}</p>
                  {p.stock <= 0 && <span className="text-[10px] text-[#ba1a1a] font-bold">OUT OF STOCK</span>}
                </div>
                <div className="flex justify-between items-end w-full">
                  <span className="text-[10px] text-slate-500">{p.stock} {p.unit}</span>
                  <span className="font-bold text-[#775a19]">₹{p.sellingPrice}</span>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && <p className="text-sm text-slate-500 col-span-2 text-center py-4">No products match search.</p>}
          </div>
        </div>
      </div>

      {showAddCust && <QuickAddCustomerModal onAdd={(c) => { const cust = addCustomer({ ...c, type: billingMode }); setSelectedCustomer(cust); setCustSearch(cust.name); setShowCustDropdown(false); setShowAddCust(false) }} onClose={() => setShowAddCust(false)} />}
      {showBillPrint && lastBill && <BillPrintModal bill={lastBill} customer={customers.find(c => c.id === lastBill.customerId)} profile={profile} onClose={() => { setShowBillPrint(false); setLastBill(null); searchRef.current?.focus() }} />}
    </div>
  )
}


