import { useState, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { Camera, Phone, MapPin, Shield, Store, Save, CircleCheckBig, Plus, X } from 'lucide-react'

export default function Settings() {
  const { profile, updateProfile, categories, addCategory } = useAppContext()
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState('profile')
  const [newCat, setNewCat] = useState('')
  const [showNewCat, setShowNewCat] = useState(false)
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    ownerName: profile.ownerName || '',
    shopName: profile.shopName || '',
    mobile: profile.mobile || '',
    address: profile.address || '',
    gstin: profile.gstin || '',
    upiId: profile.upiId || '',
    lowStockAlert: profile.lowStockAlert || 10,
  })

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => updateProfile({ photo: reader.result })
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleAddCat = () => {
    if (newCat.trim()) {
      addCategory(newCat.trim())
      setNewCat('')
      setShowNewCat(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-[#002046] tracking-tight">Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your profile, store details and preferences.</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {[{ id: 'profile', label: 'Profile' }, { id: 'store', label: 'Store Info' }, { id: 'categories', label: 'Categories' }, { id: 'preferences', label: 'Preferences' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? 'border-[#002046] text-[#002046]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-[#002046] mb-6">Owner Profile</h3>
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#002046] flex items-center justify-center overflow-hidden">
                {profile.photo ? <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" /> : <User size={32} className="text-white opacity-70" />}
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#fed488] rounded-full flex items-center justify-center hover:bg-[#f5c94e] transition-colors">
                <Camera size={13} className="text-[#002046]" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </div>
            <div>
              <p className="font-bold text-[#002046] text-lg">{profile.ownerName}</p>
              <p className="text-slate-500 text-sm">{profile.shopName}</p>
              <button onClick={() => fileRef.current?.click()} className="mt-1 text-xs text-[#002046] font-semibold hover:underline">Change Photo</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Owner Name</label>
              <input type="text" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" placeholder="Your name" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Mobile Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" placeholder="10-digit mobile" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded font-bold transition-colors ${saved ? 'bg-[#2e7d32] text-white' : 'bg-[#002046] text-white hover:bg-[#1b365d]'}`}>
              {saved ? <><CircleCheckBig size={17} /> Saved!</> : <><Save size={17} /> Save Profile</>}
            </button>
          </div>
        </div>
      )}

      {tab === 'store' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-[#002046] mb-6">Store Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Shop Name</label>
              <div className="relative">
                <Store size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Shop Address</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={3}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046] resize-none" placeholder="Full shop address" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">GSTIN Number</label>
              <div className="relative">
                <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" placeholder="22AAAAA0000A1Z5" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">UPI ID</label>
              <input type="text" value={form.upiId} onChange={e => setForm({ ...form, upiId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" placeholder="yourname@upi" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded font-bold transition-colors ${saved ? 'bg-[#2e7d32] text-white' : 'bg-[#002046] text-white hover:bg-[#1b365d]'}`}>
              {saved ? <><CircleCheckBig size={17} /> Saved!</> : <><Save size={17} /> Save Store Info</>}
            </button>
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#002046]">Product Categories</h3>
            <button onClick={() => setShowNewCat(true)} className="flex items-center gap-2 bg-[#002046] text-white px-3 py-2 rounded font-bold text-sm hover:bg-[#1b365d] transition-colors btn-pop">
              <Plus size={15} /> Add Category
            </button>
          </div>
          {showNewCat && (
            <div className="mb-4 flex gap-2 animate-fade-in">
              <input autoFocus type="text" value={newCat} onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddCat(); if (e.key === 'Escape') setShowNewCat(false) }}
                className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]"
                placeholder="Category name (e.g. Dairy, Frozen Foods)" />
              <button onClick={handleAddCat} className="bg-[#002046] text-white px-4 py-2 rounded font-bold text-sm hover:bg-[#1b365d] transition-colors">Add</button>
              <button onClick={() => setShowNewCat(false)} className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded text-sm transition-colors"><X size={15} /></button>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {categories.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-[#002046] text-sm">{c}</span>
                <div className="w-2 h-2 rounded-full bg-[#002046] opacity-30" />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">These categories appear in Inventory product management.</p>
        </div>
      )}

      {tab === 'preferences' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-[#002046] mb-6">Preferences</h3>
          <div className="space-y-5 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Low Stock Alert Threshold</label>
              <p className="text-xs text-slate-400 mb-2">Show alert when stock falls below this number</p>
              <input type="number" min="1" value={form.lowStockAlert} onChange={e => setForm({ ...form, lowStockAlert: parseInt(e.target.value) || 10 })}
                className="w-32 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#002046]" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded font-bold transition-colors ${saved ? 'bg-[#2e7d32] text-white' : 'bg-[#002046] text-white hover:bg-[#1b365d]'}`}>
              {saved ? <><CircleCheckBig size={17} /> Saved!</> : <><Save size={17} /> Save Preferences</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Used in profile section
import { User } from 'lucide-react'
