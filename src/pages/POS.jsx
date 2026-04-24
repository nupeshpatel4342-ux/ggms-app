import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { Search, Plus, X, CircleCheckBig, Printer, UserPlus, Phone, ShoppingCart, Download, MessageCircle } from 'lucide-react'
import jsPDF from 'jspdf'

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
  const printRef = useRef(null)

  const generateHighQualityPDF = () => {
    // Top-notch PDF generation using Helvetica (clean, modern sans-serif)
    const itemHeight = bill.items.length * 6;
    const totalHeight = 130 + itemHeight;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, totalHeight] });
    
    let y = 8;
    
    const printCenter = (text, yPos, size, style = 'normal') => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      const w = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
      doc.text(text, (80 - w) / 2, yPos);
    };

    const printLeftRight = (left, right, yPos, size = 9, style = 'normal') => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      doc.text(left, 4, yPos);
      const w = doc.getStringUnitWidth(right) * size / doc.internal.scaleFactor;
      doc.text(right, 76 - w, yPos);
    };

    const printLine = (yPos, type = 'solid') => {
      if (type === 'dashed') {
        doc.setLineDash([1, 1], 0);
        doc.setLineWidth(0.3);
      } else if (type === 'thick') {
        doc.setLineDash([]);
        doc.setLineWidth(0.6);
      } else {
        doc.setLineDash([]);
        doc.setLineWidth(0.3);
      }
      doc.line(4, yPos, 76, yPos);
      doc.setLineDash([]); // reset
    };

    printCenter(`Tax Invoice / Bill`, y, 8, 'bold');
    y += 6;
    printCenter(profile?.shopName || 'GGM&S Retail', y, 16, 'bold');
    y += 4;
    printCenter(`Ph: ${profile?.mobile || '9724557728'}`, y, 8);
    y += 4;
    printLine(y, 'thick');
    y += 5;
    
    printLeftRight('Bill No:', bill.id, y, 9);
    y += 5;
    printLeftRight('Date:', new Date(bill.date).toLocaleString(), y, 9);
    y += 5;
    if (customer) {
      printLeftRight('Customer:', customer.name, y, 9, 'bold');
      y += 5;
      if (customer.mobile) {
        printLeftRight('Mobile:', customer.mobile, y, 9);
        y += 5;
      }
    }
    
    y -= 1; // slight adjust
    printLine(y, 'dashed');
    y += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('# Item', 4, y);
    doc.text('Qty', 46, y, { align: 'right' });
    doc.text('Rate', 59, y, { align: 'right' });
    doc.text('Amt', 76, y, { align: 'right' });
    y += 2;
    printLine(y, 'dashed');
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    bill.items.forEach((item, index) => {
      // Clean modern font rendering
      doc.text(`${index + 1}. ${item.name.substring(0, 18)}`, 4, y);
      doc.text(`${item.quantity} ${item.unit || ''}`, 46, y, { align: 'right' });
      doc.text(`${item.sellingPrice.toFixed(2)}`, 59, y, { align: 'right' });
      doc.text(`${(item.quantity * item.sellingPrice).toFixed(2)}`, 76, y, { align: 'right' });
      y += 5;
    });
    
    y -= 1;
    printLine(y, 'thick');
    y += 5;
    
    printLeftRight('Subtotal', `Rs ${bill.subtotal.toFixed(2)}`, y, 10);
    y += 5;
    if (bill.tax > 0) {
      printLeftRight('Tax (GST)', `Rs ${bill.tax.toFixed(2)}`, y, 9);
      y += 5;
    }
    if (bill.discount > 0) {
      printLeftRight('Discount', `-Rs ${bill.discount.toFixed(2)}`, y, 9);
      y += 5;
    }
    
    y -= 1;
    printLine(y, 'dashed');
    y += 6;
    
    printLeftRight('TOTAL', `Rs ${bill.total.toFixed(2)}`, y, 13, 'bold');
    y += 3;
    printLine(y, 'thick');
    y += 6;
    
    printCenter(`Paid via ${bill.paymentMode}`, y, 10, 'bold');
    y += 5;
    printLine(y, 'dashed');
    y += 6;
    
    printCenter('Thank You For Shopping With Us!', y, 9, 'bold');
    y += 4;
    printCenter('Visit Again', y, 8, 'italic');

    return doc;
  };

  const handleWhatsApp = () => {
    const doc = generateHighQualityPDF();
    const pdfBlob = doc.output('blob');
    const fileName = `Bill_${bill.id}.pdf`;
    
    if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      navigator.share({
        files: [file],
        title: `Bill ${bill.id}`,
        text: `Here is your bill from ${profile?.shopName || 'GGM&S Retail'}`,
      }).catch(err => console.log('Share failed:', err));
    } else {
      doc.save(fileName);
      let text = `Here is your bill from *${profile?.shopName || 'GGM&S Retail'}*.\n\n_Please find the attached PDF._`;
      let url = `https://wa.me/`;
      if (customer && customer.mobile) {
        url += `91${customer.mobile}?text=${encodeURIComponent(text)}`;
      } else {
        url += `?text=${encodeURIComponent(text)}`;
      }
      setTimeout(() => { window.open(url, '_blank') }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 p-4">
      {/* Top Bar with Close Button */}
      <div className="w-full max-w-[80mm] flex justify-end mb-2">
        <button onClick={onClose} className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* HTML Preview (Premium Clean UI matching PDF) */}
      <div className="bg-white shadow-2xl overflow-y-auto max-h-[60vh] flex-shrink-0 relative w-[80mm]">
        <div id="print-area" ref={printRef} className="w-full p-4 bg-white text-black font-sans text-[12px] leading-snug">
          <div className="text-center mb-4">
            <p className="text-[10px] font-bold text-gray-600 tracking-widest uppercase mb-1">Tax Invoice</p>
            <h3 className="text-2xl font-black uppercase tracking-tight my-1">{profile?.shopName || 'GGM&S Retail'}</h3>
            <p className="text-[11px] font-medium mt-1">Ph: {profile?.mobile || '9724557728'}</p>
          </div>
          
          <div className="border-t-2 border-black py-2 mb-3 space-y-1">
            <div className="flex justify-between"><span>Bill No:</span><span className="font-bold">{bill.id}</span></div>
            <div className="flex justify-between"><span>Date:</span><span className="font-medium">{new Date(bill.date).toLocaleString()}</span></div>
            {customer && (
              <>
                <div className="flex justify-between mt-2"><span>Customer:</span><span className="font-bold">{customer.name}</span></div>
                {customer.mobile && <div className="flex justify-between"><span>Mobile:</span><span className="font-medium">{customer.mobile}</span></div>}
              </>
            )}
          </div>

          <table className="w-full mb-3">
            <thead>
              <tr className="border-y border-black font-bold text-[11px]">
                <th className="text-left py-2 w-[45%]">Item</th>
                <th className="text-right py-2 w-[18%]">Qty</th>
                <th className="text-right py-2 w-[17%]">Rate</th>
                <th className="text-right py-2 w-[20%]">Amt</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {bill.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-2 pr-1 font-medium">{i + 1}. {item.name}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{item.sellingPrice.toFixed(2)}</td>
                  <td className="py-2 text-right font-bold">{(item.sellingPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-black pt-2 space-y-1.5">
            <div className="flex justify-between text-[13px] font-semibold"><span>Subtotal</span><span>₹{bill.subtotal.toFixed(2)}</span></div>
            {bill.tax > 0 && <div className="flex justify-between text-[11px]"><span>Tax (GST)</span><span>₹{bill.tax.toFixed(2)}</span></div>}
            {bill.discount > 0 && <div className="flex justify-between text-[11px]"><span>Discount</span><span>-₹{bill.discount.toFixed(2)}</span></div>}
            <div className="flex justify-between border-t border-dashed border-gray-400 pt-2 mt-2 font-black text-[16px]"><span>TOTAL</span><span>₹{bill.total.toFixed(2)}</span></div>
            <div className="border-t-2 border-black mt-2 pt-3 pb-1 text-center font-bold text-[14px]">
              Paid via {bill.paymentMode}
            </div>
          </div>
          
          <div className="border-t border-dashed border-gray-400 mt-3 pt-3 text-center text-[11px] font-medium space-y-1">
            <p className="font-bold">Thank You For Shopping With Us!</p>
            <p className="italic text-gray-600">Visit Again</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Only 2) */}
      <div className="flex gap-4 mt-6 w-full max-w-[80mm] justify-between">
        <button onClick={handleWhatsApp} className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebd5a] transition-colors shadow-lg font-bold text-lg">
          <MessageCircle size={24} /> WhatsApp
        </button>
        <button onClick={() => window.print()} className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#002046] text-white rounded-lg hover:bg-[#1b365d] transition-colors shadow-lg font-bold text-lg">
          <Printer size={24} /> Print
        </button>
      </div>
    </div>
  )
}

export default function POS() {
  const { products, customers, addCustomer, processBill, profile } = useAppContext()
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
  const searchRef = useRef(null)
  const custRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'F1') { e.preventDefault(); searchRef.current?.focus() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filteredProducts = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search))
    : products

  const matchedCustomers = custSearch
    ? customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.mobile.includes(custSearch))
    : []

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.findIndex(c => c.id === product.id)
      if (existing !== -1) {
        const updated = [...prev]
        if (updated[existing].quantity < product.stock) updated[existing].quantity += 1
        return updated
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c
      const newQty = c.quantity + delta
      const product = products.find(p => p.id === id)
      if (newQty < 1 || (product && newQty > product.stock)) return c
      return { ...c, quantity: newQty }
    }).filter(c => c.quantity > 0))
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
      subtotal,
      tax,
      discount: parseFloat(discount || 0),
      total,
      udharAmount: paymentMode === 'Udhar' ? total : 0,
    })

    setLastBill({ ...bill, shopName: profile?.shopName })
    setShowBillPrint(true)
    setCart([])
    setSelectedCustomer(null)
    setCustSearch('')
    setPaymentMode('Cash')
    setDiscount(0)
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Left side - Cart */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-[#002046] tracking-tight">Billing / POS</h2>
            <p className="text-slate-500 text-sm mt-1">Create bills and process transactions.</p>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-[#002046]">Current Bill</h3>
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
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded bg-slate-200 text-[#002046] font-bold hover:bg-slate-300 transition-colors">−</button>
                          <span className="font-bold text-[#002046] w-8 text-center">{item.quantity}</span>
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

      {showAddCust && <QuickAddCustomerModal onAdd={(c) => { const cust = addCustomer(c); setSelectedCustomer(cust); setCustSearch(cust.name); setShowCustDropdown(false); setShowAddCust(false) }} onClose={() => setShowAddCust(false)} />}
      {showBillPrint && lastBill && <BillPrintModal bill={lastBill} customer={customers.find(c => c.id === lastBill.customerId)} profile={profile} onClose={() => { setShowBillPrint(false); setLastBill(null); searchRef.current?.focus() }} />}
    </div>
  )
}


