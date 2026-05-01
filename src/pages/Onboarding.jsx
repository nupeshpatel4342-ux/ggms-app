import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { Store, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Onboarding() {
  const { profile, updateProfile, cloudLoaded } = useAppContext()
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    mobile: ''
  })
  const [saving, setSaving] = useState(false)

  // If data is still loading, show nothing or a spinner
  if (!cloudLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001229] via-[#002046] to-[#003366] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  // If already setup, go to dashboard
  if (profile.isSetup) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.shopName.trim() || !form.ownerName.trim()) return
    
    setSaving(true)
    
    // Simulate slight delay for better UX
    setTimeout(() => {
      updateProfile({
        ...form,
        isSetup: true
      })
      // The ProtectedRoute will automatically catch the isSetup:true and redirect to "/"
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001229] via-[#002046] to-[#003366] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-[#002046] p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-32 h-32 bg-[#fed488]/20 rounded-full blur-2xl"></div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-4 shadow-xl">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome to GGM&S</h1>
          <p className="text-white/70 text-sm mt-1">Let's set up your store profile first.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Shop / Business Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={form.shopName}
                  onChange={e => setForm({...form, shopName: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#002046] focus:ring-1 focus:ring-[#002046] transition-all font-medium text-[#002046]" 
                  placeholder="e.g. Mahadev Kirana Store" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Owner Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={form.ownerName}
                  onChange={e => setForm({...form, ownerName: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#002046] focus:ring-1 focus:ring-[#002046] transition-all font-medium text-[#002046]" 
                  placeholder="Your full name" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Mobile Number (Optional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="tel" 
                  value={form.mobile}
                  onChange={e => setForm({...form, mobile: e.target.value.replace(/\D/g, '')})}
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#002046] focus:ring-1 focus:ring-[#002046] transition-all font-medium text-[#002046]" 
                  placeholder="10-digit number" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving || !form.shopName.trim() || !form.ownerName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#002046] text-white rounded-xl font-bold hover:bg-[#1b365d] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {saving ? (
                <>
                  <CheckCircle2 size={18} className="animate-pulse" />
                  Saving Profile...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
