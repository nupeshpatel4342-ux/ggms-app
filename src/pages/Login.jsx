import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mail, Phone, ArrowRight, ShieldCheck, Store, Loader2 } from 'lucide-react'

export default function Login() {
  const { loginWithGoogle, sendOtp, verifyOtp } = useAuth()
  const [mode, setMode] = useState('choose') // 'choose' | 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmResult, setConfirmResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.')
    }
    setLoading(false)
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    setError('')
    try {
      const confirmation = await sendOtp(`+91${phoneNumber}`, 'recaptcha-container')
      setConfirmResult(confirmation)
      setMode('otp')
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    setError('')
    try {
      await verifyOtp(confirmResult, otp)
    } catch (err) {
      setError('Invalid OTP. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001229] via-[#002046] to-[#003366] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1b365d]/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#775a19]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#002046]/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-4 shadow-2xl">
            <Store size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">GGM&S</h1>
          <p className="text-white/60 text-sm mt-1 font-medium tracking-wider uppercase">Retail Merchant</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-8">
            {mode === 'choose' && (
              <>
                <h2 className="text-xl font-bold text-white text-center mb-2">Welcome Back</h2>
                <p className="text-white/50 text-center text-sm mb-8">Sign in to access your store</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white text-[#002046] rounded-xl font-bold text-sm hover:bg-slate-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/20" />
                  <span className="text-white/40 text-xs font-medium uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/20" />
                </div>

                {/* Phone Sign In */}
                <button
                  onClick={() => { setMode('phone'); setError('') }}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Phone size={20} />
                  Continue with Mobile Number
                </button>
              </>
            )}

            {mode === 'phone' && (
              <>
                <button onClick={() => { setMode('choose'); setError('') }} className="text-white/50 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors">
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-white mb-1">Enter Mobile Number</h2>
                <p className="text-white/50 text-sm mb-6">We'll send you a verification OTP</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendOtp}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1 px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Enter 10-digit number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || phoneNumber.length !== 10}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#775a19] text-white rounded-xl font-bold text-sm hover:bg-[#8d6b1f] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              </>
            )}

            {mode === 'otp' && (
              <>
                <button onClick={() => { setMode('phone'); setError('') }} className="text-white/50 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors">
                  ← Back
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={22} className="text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">Verify OTP</h2>
                </div>
                <p className="text-white/50 text-sm mb-6">OTP sent to +91 {phoneNumber}</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all mb-6"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Bottom strip */}
          <div className="px-8 py-4 bg-white/5 border-t border-white/10">
            <p className="text-white/30 text-xs text-center">
              Secure login powered by Firebase • Your data is encrypted
            </p>
          </div>
        </div>

        {/* Recaptcha container (invisible) */}
        <div id="recaptcha-container"></div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2026 GGM&S Retail Merchant • All rights reserved
        </p>
      </div>
    </div>
  )
}
