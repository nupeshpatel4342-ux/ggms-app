import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Search, X, Printer, MessageCircle, Ban, Eye, FileText, Download, Trash2, SquarePen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { printBillPDF, shareBillWhatsApp, downloadBillPDF } from '../utils/billPdf'

function BillDetailModal({ bill, customer, profile, onClose, onVoid }) {
  const totalQty = bill.items.reduce((s, i) => s + i.quantity, 0)
  const rawTotal = bill.subtotal + (bill.tax || 0) - (bill.discount || 0)
  const roundOff = (Math.round(rawTotal) - rawTotal).toFixed(2)
  const halfTax = bill.tax > 0 ? (bill.tax / 2).toFixed(2) : null

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 p-4">
      <div className="w-full max-w-[80mm] flex justify-end mb-2">
        <button onClick={onClose} className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors"><X size={20} /></button>
      </div>
      <div className="bg-white shadow-2xl overflow-y-auto max-h-[60vh] flex-shrink-0 relative w-[80mm]">
        <div className="w-full px-3 py-4 bg-white text-black font-mono text-[11px] leading-tight">
          {bill.status === 'void' && (
            <div className="text-center mb-3 py-1.5 bg-red-50 border-2 border-red-300 rounded">
              <p className="text-red-600 font-black text-[10px] tracking-[3px]">*** CANCELLED / VOID ***</p>
            </div>
          )}
          <div className="text-center mb-2">
            <p className="text-[8px] font-bold text-gray-500 tracking-[3px] uppercase">Tax Invoice</p>
            <h3 className="text-[18px] font-black uppercase tracking-tight mt-1 mb-1">{profile?.shopName || 'GGM&S Retail'}</h3>
            {profile?.address && <p className="text-[9px] text-gray-600 leading-snug mb-0.5">{profile.address}</p>}
            {profile?.mobile && <p className="text-[10px] font-medium">Ph: {profile.mobile}</p>}
            {profile?.gstin && <p className="text-[8px] font-bold text-gray-700 mt-0.5">GSTIN: {profile.gstin}</p>}
          </div>
          <div className="border-t-2 border-b-2 border-black my-2 h-[2px]" />
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
          <div className="border-t border-b border-black py-1 mt-1">
            <div className="flex text-[8px] font-bold uppercase tracking-wide">
              <span className="w-[8%]">SR</span><span className="flex-1">ITEM NAME</span><span className="w-[22%] text-right">AMOUNT</span>
            </div>
          </div>
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
          <div className="border-t-2 border-b-2 border-black my-1 h-[2px]" />
          <p className="text-[8px] text-gray-500 py-1">Total Items: {bill.items.length} &nbsp;|&nbsp; Total Qty: {Number.isInteger(totalQty) ? totalQty : totalQty.toFixed(2)}</p>
          <div className="py-1 space-y-1 text-[10px]">
            <div className="flex justify-between font-semibold"><span>Subtotal</span><span>₹{bill.subtotal.toFixed(2)}</span></div>
            {halfTax && (
              <>
                <div className="flex justify-between text-[9px] text-gray-600"><span>CGST (2.5%)</span><span>₹{halfTax}</span></div>
                <div className="flex justify-between text-[9px] text-gray-600"><span>SGST (2.5%)</span><span>₹{halfTax}</span></div>
              </>
            )}
            {bill.discount > 0 && <div className="flex justify-between text-[9px] text-red-600"><span>Discount</span><span>-₹{bill.discount.toFixed(2)}</span></div>}
            {Math.abs(parseFloat(roundOff)) >= 0.01 && <div className="flex justify-between text-[8px] text-gray-500"><span>Round Off</span><span>₹{roundOff}</span></div>}
          </div>
          <div className="border-t-2 border-b-2 border-black py-2 my-1">
            <div className="flex justify-between font-black text-[15px]"><span>GRAND TOTAL</span><span>₹{bill.total.toFixed(2)}</span></div>
          </div>
          <div className="text-center py-2 font-bold text-[11px]">Paid by: {bill.paymentMode.toUpperCase()}</div>
          {bill.discount > 0 && (
            <div className="text-center py-1 border-t border-dashed border-gray-400">
              <p className="text-[9px] font-bold text-green-700">★ You Saved ₹{bill.discount.toFixed(2)} on this bill! ★</p>
            </div>
          )}
          {profile?.upiId && bill.paymentMode !== 'Cash' && (
            <div className="text-center py-1.5 border-t border-dashed border-gray-400">
              <p className="text-[8px] text-gray-500">Pay via UPI:</p>
              <p className="text-[9px] font-bold">{profile.upiId}</p>
            </div>
          )}
          <div className="border-t border-dashed border-gray-400 mt-1 pt-2 text-center">
            <p className="font-bold text-[10px]">Thank You! Visit Again!</p>
            <p className="text-[7px] text-gray-500 mt-1.5 leading-relaxed">Goods once sold will not be taken back.<br/>Subject to local jurisdiction. E. & O.E.</p>
          </div>
        </div>
      </div>
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
        {bill.status !== 'void' && (
          <button onClick={() => { if (window.confirm(`Are you sure you want to VOID bill ${bill.id}?`)) { onVoid(bill.id); onClose(); } }}
            className="flex justify-center items-center gap-2 py-3 px-4 bg-[#ba1a1a] text-white rounded-lg hover:bg-[#8c1414] transition-colors shadow-lg font-bold text-sm">
            <Ban size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
export default function BillHistory() {
  const { bills, customers, profile, voidBill, deleteBill } = useAppContext()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [billTypeFilter, setBillTypeFilter] = useState('all')
  const [selectedBill, setSelectedBill] = useState(null)

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().slice(0, 10)

  const filtered = bills.filter(b => {
    const d = b.date?.slice(0, 10)
    if (dateFilter === 'today' && d !== todayStr) return false
    if (dateFilter === 'week' && d < weekAgo) return false
    if (dateFilter === 'month' && d < monthAgo) return false
    if (statusFilter === 'active' && b.status === 'void') return false
    if (statusFilter === 'void' && b.status !== 'void') return false
    if (statusFilter === 'udhar' && (b.paymentMode !== 'Udhar' || b.status === 'void')) return false
    if (billTypeFilter === 'retail' && b.billType !== 'retail') return false
    if (billTypeFilter === 'wholesale' && b.billType !== 'wholesale') return false
    if (search) {
      const q = search.toLowerCase()
      const cust = customers.find(c => c.id === b.customerId)
      return b.id.toLowerCase().includes(q) || (cust?.name?.toLowerCase() || '').includes(q) || (cust?.mobile || '').includes(q)
    }
    return true
  })

  const totalActive = filtered.filter(b => b.status !== 'void').reduce((s, b) => s + b.total, 0)

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#002046] tracking-tight">Bill History</h2>
          <p className="text-slate-500 text-sm mt-1">View, re-print, and manage all past bills.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#002046] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Bills</p>
          <h3 className="text-2xl font-black text-[#002046]">{filtered.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#2e7d32] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Revenue</p>
          <h3 className="text-2xl font-black text-[#2e7d32]">₹{totalActive.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#775a19] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cash Bills</p>
          <h3 className="text-2xl font-black text-[#775a19]">{filtered.filter(b => b.paymentMode === 'Cash' && b.status !== 'void').length}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#ba1a1a] shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Voided</p>
          <h3 className="text-2xl font-black text-[#ba1a1a]">{filtered.filter(b => b.status === 'void').length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by Bill ID, Customer..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-[#002046]" />
          </div>
          <div className="flex gap-1">
            {[{ id: 'today', label: 'Today' }, { id: 'week', label: '7 Days' }, { id: 'month', label: '30 Days' }, { id: 'all', label: 'All' }].map(f => (
              <button key={f.id} onClick={() => setDateFilter(f.id)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${dateFilter === f.id ? 'bg-[#002046] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'}`}>{f.label}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {[{ id: 'all', label: 'All Types' }, { id: 'retail', label: '🛒 Retail' }, { id: 'wholesale', label: '📦 Wholesale' }].map(f => (
              <button key={f.id} onClick={() => setBillTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${billTypeFilter === f.id ? 'bg-[#775a19] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'}`}>{f.label}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {[{ id: 'all', label: 'All Status' }, { id: 'active', label: 'Active' }, { id: 'udhar', label: '💰 Udhar' }, { id: 'void', label: 'Voided' }].map(f => (
              <button key={f.id} onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${statusFilter === f.id ? (f.id === 'udhar' ? 'bg-[#ba1a1a] text-white' : 'bg-[#002046] text-white') : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'}`}>{f.label}</button>
            ))}
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
              <th className="p-4 font-semibold">Bill #</th>
              <th className="p-4 font-semibold">Date & Time</th>
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold text-center">Items</th>
              <th className="p-4 font-semibold text-center">Payment</th>
              <th className="p-4 font-semibold text-right">Amount</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const cust = customers.find(c => c.id === b.customerId)
              return (
                <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${b.status === 'void' ? 'opacity-60' : ''}`}>
                  <td className="p-4"><div className="flex items-center gap-2"><FileText size={16} className="text-slate-400" /><span className="font-bold text-[#002046] text-sm">{b.id}</span>{b.billType === 'wholesale' && <span className="text-[9px] font-bold text-[#775a19] bg-[#ffddb9] px-1.5 py-0.5 rounded">W</span>}</div></td>
                  <td className="p-4"><p className="text-sm font-medium text-slate-700">{new Date(b.date).toLocaleDateString()}</p><p className="text-[10px] text-slate-400">{new Date(b.date).toLocaleTimeString()}</p></td>
                  <td className="p-4 text-sm text-slate-600">{cust?.name || <span className="text-slate-400 italic">Walk-in</span>}</td>
                  <td className="p-4 text-center text-sm font-medium text-slate-600">{b.items.length}</td>
                  <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${b.paymentMode === 'Cash' ? 'bg-[#e8f5e9] text-[#2e7d32]' : b.paymentMode === 'UPI' ? 'bg-[#ffddb9] text-[#775a19]' : 'bg-[#ffdad6] text-[#ba1a1a]'}`}>{b.paymentMode}</span></td>
                  <td className="p-4 text-right font-bold text-[#002046]">₹{b.total.toFixed(2)}</td>
                  <td className="p-4 text-center">{b.status === 'void' ? <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-600">VOID</span> : <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-600">Active</span>}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      {b.paymentMode === 'Udhar' && b.status !== 'void' && cust?.mobile && (
                        <button onClick={() => {
                          const shopName = profile?.shopName || 'GGM&S Retail'
                          const billDate = new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          const itemLines = b.items.map((item, idx) => {
                            const qty = Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)
                            return `${idx + 1}. ${item.name} — ${qty} ${item.unit || 'pcs'} × ₹${item.sellingPrice.toFixed(0)} = *₹${(item.quantity * item.sellingPrice).toFixed(2)}*`
                          }).join('\n')
                          const lines = [
                            `🙏 *Udhar Payment Reminder*`,
                            ``,
                            `Namaskar *${cust.name}* ji,`,
                            ``,
                            `Aapno niche no bill *${shopName}* par udhar baaki che:`,
                            ``,
                            `📋 *Bill No:* ${b.id}`,
                            `📅 *Date:* ${billDate}`,
                            ``,
                            `*━━━ Bill Details ━━━*`,
                            itemLines,
                            `*━━━━━━━━━━━━━━━━━*`,
                            ``,
                            b.discount > 0 ? `Subtotal: ₹${b.subtotal.toFixed(2)}` : '',
                            b.discount > 0 ? `Discount: -₹${b.discount.toFixed(2)}` : '',
                            `💰 *Baaki Amount: ₹${b.total.toFixed(2)}*`,
                            ``,
                            `Kripya tamari suvidha ae jaldi thi payment karo.`,
                            ``,
                            `Dhanyavaad! 🙏`,
                            `*${shopName}*`,
                            profile?.mobile ? `📞 ${profile.mobile}` : '',
                          ].filter(Boolean).join('\n')
                          window.open(`https://wa.me/91${cust.mobile}?text=${encodeURIComponent(lines)}`, '_blank')
                        }} className="px-2 py-1 bg-[#25D366] text-white rounded text-xs font-bold hover:bg-[#1ebd5a] transition-colors inline-flex items-center gap-1" title="Send Udhar Reminder">
                          <MessageCircle size={12} /> Remind
                        </button>
                      )}
                      <button onClick={() => setSelectedBill(b)} className="p-2 text-slate-400 hover:text-[#002046] transition-colors" title="View / Re-print"><Eye size={18} /></button>
                      <button onClick={() => {
                        localStorage.setItem('ggms_edit_bill', JSON.stringify(b))
                        navigate('/pos')
                      }} className="p-2 text-slate-400 hover:text-[#775a19] transition-colors" title="Edit Bill"><SquarePen size={18} /></button>
                      <button onClick={() => deleteBill(b.id)} className="p-2 text-slate-400 hover:text-[#ba1a1a] transition-colors" title="Delete Bill"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-slate-500">No bills found.</td></tr>}
          </tbody>
        </table>
      </div>

      {selectedBill && (
        <BillDetailModal bill={selectedBill} customer={customers.find(c => c.id === selectedBill.customerId)} profile={profile} onClose={() => setSelectedBill(null)} onVoid={voidBill} />
      )}
    </div>
  )
}
