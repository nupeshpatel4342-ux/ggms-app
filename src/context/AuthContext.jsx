import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider, db } from '../firebase'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsub
  }, [])

  // Google Sign-In
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err) {
      console.error('Google login error:', err)
      throw err
    }
  }

  // Phone OTP — Step 1: Send OTP
  const sendOtp = async (phoneNumber, recaptchaContainerId) => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
          size: 'invisible',
          callback: () => {},
        })
      }
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
      return confirmation
    } catch (err) {
      console.error('OTP send error:', err)
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
      throw err
    }
  }

  // Phone OTP — Step 2: Verify OTP
  const verifyOtp = async (confirmationResult, otp) => {
    try {
      const result = await confirmationResult.confirm(otp)
      return result.user
    } catch (err) {
      console.error('OTP verify error:', err)
      throw err
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Save all app data to Firestore for this user
  const saveDataToCloud = async (data) => {
    if (!user) return
    try {
      await setDoc(doc(db, 'stores', user.uid), {
        ...data,
        lastUpdated: new Date().toISOString(),
        userEmail: user.email || '',
        userPhone: user.phoneNumber || '',
      }, { merge: true })
    } catch (err) {
      console.error('Cloud save error:', err)
    }
  }

  // Load all app data from Firestore for this user
  const loadDataFromCloud = async () => {
    if (!user) return null
    try {
      const snap = await getDoc(doc(db, 'stores', user.uid))
      if (snap.exists()) {
        return snap.data()
      }
      return null
    } catch (err) {
      console.error('Cloud load error:', err)
      return null
    }
  }

  const value = {
    user,
    loading,
    loginWithGoogle,
    sendOtp,
    verifyOtp,
    logout,
    saveDataToCloud,
    loadDataFromCloud,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
