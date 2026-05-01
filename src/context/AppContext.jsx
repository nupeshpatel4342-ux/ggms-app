import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AppContext = createContext()

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback
    if (!Array.isArray(fallback) && Array.isArray(parsed)) return fallback
    return parsed ?? fallback
  } catch { return fallback }
}

function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

function sanitizeProduct(p) {
  if (!p || typeof p !== 'object') return null
  return {
    id: String(p.id ?? Date.now()),
    name: String(p.name ?? 'Unknown Product'),
    category: String(p.category ?? 'Other'),
    purchasePrice: Math.max(0, parseFloat(p.purchasePrice) || 0),
    sellingPrice: Math.max(0, parseFloat(p.sellingPrice) || 0),
    stock: Math.max(0, parseFloat(p.stock) || 0),
    unit: String(p.unit ?? 'pcs'),
    barcode: String(p.barcode ?? ''),
    expiryDate: p.expiryDate ? String(p.expiryDate) : '',
    agencyId: p.agencyId ? String(p.agencyId) : '',
  }
}

function sanitizeCustomer(c) {
  if (!c || typeof c !== 'object') return null
  return {
    id: String(c.id ?? Date.now()),
    name: String(c.name ?? 'Unknown'),
    mobile: String(c.mobile ?? ''),
    address: String(c.address ?? ''),
    udhar: Math.max(0, parseFloat(c.udhar) || 0),
    type: ['retail', 'wholesale'].includes(c.type) ? c.type : 'retail',
  }
}

function sanitizeSupplier(s) {
  if (!s || typeof s !== 'object') return null
  return {
    id: String(s.id ?? Date.now()),
    name: String(s.name ?? 'Unknown Supplier'),
    contact: String(s.contact ?? ''),
    address: String(s.address ?? ''),
    pendingPayment: Math.max(0, parseFloat(s.pendingPayment) || 0),
  }
}

function sanitizeBillItem(item) {
  if (!item || typeof item !== 'object') return null
  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? 'Item'),
    sellingPrice: Math.max(0, parseFloat(item.sellingPrice) || 0),
    purchasePrice: Math.max(0, parseFloat(item.purchasePrice) || 0),
    quantity: Math.max(0.001, parseFloat(item.quantity) || 1),
    unit: String(item.unit ?? 'pcs'),
    category: String(item.category ?? ''),
    gstRate: Math.max(0, parseFloat(item.gstRate) || 0),
  }
}

function sanitizeBill(b) {
  if (!b || typeof b !== 'object') return null
  const items = Array.isArray(b.items) ? b.items.map(sanitizeBillItem).filter(Boolean) : []
  return {
    id: String(b.id ?? 'BILL-000000'),
    date: b.date ? String(b.date) : new Date().toISOString(),
    billType: ['retail', 'wholesale'].includes(b.billType) ? b.billType : 'retail',
    items,
    customerId: b.customerId ? String(b.customerId) : null,
    paymentMode: ['Cash', 'UPI', 'Udhar'].includes(b.paymentMode) ? b.paymentMode : 'Cash',
    subtotal: Math.max(0, parseFloat(b.subtotal) || 0),
    tax: Math.max(0, parseFloat(b.tax) || 0),
    discount: Math.max(0, parseFloat(b.discount) || 0),
    total: Math.max(0, parseFloat(b.total) || 0),
    udharAmount: Math.max(0, parseFloat(b.udharAmount) || 0),
    status: b.status === 'void' ? 'void' : 'active',
  }
}

function sanitizePurchaseItem(item) {
  if (!item || typeof item !== 'object') return null
  return {
    productId: String(item.productId ?? ''),
    name: String(item.name ?? 'Item'),
    quantity: Math.max(0, parseFloat(item.quantity) || 0),
    price: Math.max(0, parseFloat(item.price) || 0),
  }
}

function sanitizePurchase(p) {
  if (!p || typeof p !== 'object') return null
  const items = Array.isArray(p.items) ? p.items.map(sanitizePurchaseItem).filter(Boolean) : []
  return {
    id: String(p.id ?? 'PUR-000000'),
    date: p.date ? String(p.date) : new Date().toISOString(),
    supplierId: p.supplierId ? String(p.supplierId) : null,
    items,
    total: Math.max(0, parseFloat(p.total) || 0),
    paidAmount: Math.max(0, parseFloat(p.paidAmount) || 0),
    pendingAmount: Math.max(0, parseFloat(p.pendingAmount) || 0),
  }
}

function sanitizeStockAdjustment(a) {
  if (!a || typeof a !== 'object') return null
  return {
    id: String(a.id ?? Date.now()),
    productId: String(a.productId ?? ''),
    productName: String(a.productName ?? ''),
    type: ['add', 'remove'].includes(a.type) ? a.type : 'remove',
    quantity: Math.max(0, parseFloat(a.quantity) || 0),
    reason: String(a.reason ?? ''),
    date: a.date ? String(a.date) : new Date().toISOString(),
  }
}

function sanitizeProfile(p) {
  if (!p || typeof p !== 'object') return {}
  return {
    ownerName: String(p.ownerName ?? 'Store Owner'),
    shopName: String(p.shopName ?? 'GGM&S Retail'),
    mobile: String(p.mobile ?? ''),
    address: String(p.address ?? ''),
    gstin: String(p.gstin ?? ''),
    upiId: String(p.upiId ?? ''),
    photo: p.photo ? String(p.photo) : null,
    lowStockAlert: Math.max(1, parseInt(p.lowStockAlert) || 10),
  }
}

function sanitizeAgency(a) {
  if (!a || typeof a !== 'object') return null
  return {
    id: String(a.id ?? Date.now()),
    name: String(a.name ?? 'Unknown Agency'),
    contact: String(a.contact ?? ''),
    address: String(a.address ?? ''),
    area: String(a.area ?? ''),
    gstin: String(a.gstin ?? ''),
    status: ['active', 'inactive'].includes(a.status) ? a.status : 'active',
    notes: String(a.notes ?? ''),
    createdAt: a.createdAt ? String(a.createdAt) : new Date().toISOString(),
  }
}

function sanitizeAgencySale(s) {
  if (!s || typeof s !== 'object') return null
  return {
    id: String(s.id ?? Date.now()),
    agencyId: String(s.agencyId ?? ''),
    date: s.date ? String(s.date) : new Date().toISOString(),
    productName: String(s.productName ?? ''),
    quantity: Math.max(0, parseFloat(s.quantity) || 0),
    unit: String(s.unit ?? 'pcs'),
    rate: Math.max(0, parseFloat(s.rate) || 0),
    amount: Math.max(0, parseFloat(s.amount) || 0),
    commission: Math.max(0, parseFloat(s.commission) || 0),
    paymentStatus: ['paid', 'pending', 'partial'].includes(s.paymentStatus) ? s.paymentStatus : 'pending',
    notes: String(s.notes ?? ''),
  }
}

function sanitizeArray(arr, fn) {
  return Array.isArray(arr) ? arr.map(fn).filter(Boolean) : []
}

function sanitizeCategories(arr) {
  if (!Array.isArray(arr)) return DEFAULT_CATEGORIES
  const filtered = arr.filter(c => typeof c === 'string' && c.trim().length > 0)
  return filtered.length > 0 ? filtered : DEFAULT_CATEGORIES
}

// Default data
const DEFAULT_PRODUCTS = [
  { id: '1', name: 'Premium Basmati Rice', category: 'Grocery', purchasePrice: 80, sellingPrice: 110, stock: 120, unit: 'kg', barcode: '890123456001', expiryDate: '' },
  { id: '2', name: 'Refined Sunflower Oil', category: 'Oil', purchasePrice: 130, sellingPrice: 155, stock: 45, unit: 'liter', barcode: '890123456002', expiryDate: '' },
  { id: '3', name: 'Tata Salt', category: 'Grocery', purchasePrice: 18, sellingPrice: 24, stock: 80, unit: 'kg', barcode: '890123456003', expiryDate: '' },
  { id: '4', name: 'Aashirvaad Atta 5kg', category: 'Grocery', purchasePrice: 190, sellingPrice: 230, stock: 3, unit: 'pcs', barcode: '890123456004', expiryDate: '' },
  { id: '5', name: 'Haldiram Moong Dal', category: 'Snacks', purchasePrice: 35, sellingPrice: 50, stock: 10, unit: 'pcs', barcode: '890123456005', expiryDate: '' },
]

const DEFAULT_CUSTOMERS = [
  { id: '1', name: 'Rahul Sharma', mobile: '9876543210', address: '', udhar: 1250 },
  { id: '2', name: 'Sneha Patel', mobile: '9123456780', address: '', udhar: 0 },
  { id: '3', name: 'Amit Singh', mobile: '9988776655', address: '', udhar: 450 },
]

const DEFAULT_SUPPLIERS = [
  { id: '1', name: 'Agrawal Distributors', contact: '9000100011', address: '', pendingPayment: 5400 },
  { id: '2', name: 'MegaMart Wholesale', contact: '9000100022', address: '', pendingPayment: 0 },
]

const DEFAULT_AGENCIES = []

const DEFAULT_CATEGORIES = ['Grocery', 'Oil', 'Snacks', 'Spices', 'Beverages', 'Dairy', 'Other']

const DEFAULT_PROFILE = {
  ownerName: 'Store Owner',
  shopName: 'GGM&S Retail',
  mobile: '',
  address: '',
  gstin: '',
  upiId: '',
  photo: null,
  lowStockAlert: 10,
}

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() => sanitizeProfile(loadFromStorage('ggms_profile', DEFAULT_PROFILE)))
  const [categories, setCategories] = useState(() => sanitizeCategories(loadFromStorage('ggms_categories', DEFAULT_CATEGORIES)))
  const [products, setProducts] = useState(() => sanitizeArray(loadFromStorage('ggms_products', DEFAULT_PRODUCTS), sanitizeProduct))
  const [customers, setCustomers] = useState(() => sanitizeArray(loadFromStorage('ggms_customers', DEFAULT_CUSTOMERS), sanitizeCustomer))
  const [suppliers, setSuppliers] = useState(() => sanitizeArray(loadFromStorage('ggms_suppliers', DEFAULT_SUPPLIERS), sanitizeSupplier))
  const [bills, setBills] = useState(() => sanitizeArray(loadFromStorage('ggms_bills', []), sanitizeBill))
  const [purchases, setPurchases] = useState(() => sanitizeArray(loadFromStorage('ggms_purchases', []), sanitizePurchase))
  const [stockAdjustments, setStockAdjustments] = useState(() => sanitizeArray(loadFromStorage('ggms_stock_adjustments', []), sanitizeStockAdjustment))
  const [agencies, setAgencies] = useState(() => sanitizeArray(loadFromStorage('ggms_agencies', DEFAULT_AGENCIES), sanitizeAgency))
  const [agencySales, setAgencySales] = useState(() => sanitizeArray(loadFromStorage('ggms_agency_sales', []), sanitizeAgencySale))

  useEffect(() => saveToStorage('ggms_profile', profile), [profile])
  useEffect(() => saveToStorage('ggms_categories', categories), [categories])
  useEffect(() => saveToStorage('ggms_products', products), [products])
  useEffect(() => saveToStorage('ggms_customers', customers), [customers])
  useEffect(() => saveToStorage('ggms_suppliers', suppliers), [suppliers])
  useEffect(() => saveToStorage('ggms_bills', bills), [bills])
  useEffect(() => saveToStorage('ggms_purchases', purchases), [purchases])
  useEffect(() => saveToStorage('ggms_stock_adjustments', stockAdjustments), [stockAdjustments])
  useEffect(() => saveToStorage('ggms_agencies', agencies), [agencies])
  useEffect(() => saveToStorage('ggms_agency_sales', agencySales), [agencySales])

  // ─── Cloud Sync ───
  const [cloudLoaded, setCloudLoaded] = useState(false)
  const syncTimerRef = useRef(null)

  // Load data from Firestore when user is logged in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!cloudLoaded) {
          try {
            const snap = await getDoc(doc(db, 'stores', firebaseUser.uid))
            if (snap.exists()) {
              const data = snap.data()
              if (data.profile) setProfile(sanitizeProfile(data.profile))
              if (data.categories) setCategories(sanitizeCategories(data.categories))
              if (data.products) setProducts(sanitizeArray(data.products, sanitizeProduct))
              if (data.customers) setCustomers(sanitizeArray(data.customers, sanitizeCustomer))
              if (data.suppliers) setSuppliers(sanitizeArray(data.suppliers, sanitizeSupplier))
              if (data.bills) setBills(sanitizeArray(data.bills, sanitizeBill))
              if (data.purchases) setPurchases(sanitizeArray(data.purchases, sanitizePurchase))
              if (data.stockAdjustments) setStockAdjustments(sanitizeArray(data.stockAdjustments, sanitizeStockAdjustment))
              if (data.agencies) setAgencies(sanitizeArray(data.agencies, sanitizeAgency))
              if (data.agencySales) setAgencySales(sanitizeArray(data.agencySales, sanitizeAgencySale))
            } else {
              // New user - clear any leftover local storage data to prevent merging accounts
              setProfile(sanitizeProfile(DEFAULT_PROFILE))
              setCategories([...DEFAULT_CATEGORIES])
              setProducts(DEFAULT_PRODUCTS.map(p => sanitizeProduct(p)))
              setCustomers(DEFAULT_CUSTOMERS.map(c => sanitizeCustomer(c)))
              setSuppliers(DEFAULT_SUPPLIERS.map(s => sanitizeSupplier(s)))
              setBills([])
              setPurchases([])
              setStockAdjustments([])
              setAgencies([])
              setAgencySales([])
            }
            setCloudLoaded(true)
          } catch (err) {
            console.error('Cloud load error:', err)
            setCloudLoaded(true) // continue even on error
          }
        }
      } else {
        // User logged out - clean up local state and storage immediately
        setProfile(sanitizeProfile(DEFAULT_PROFILE))
        setCategories([...DEFAULT_CATEGORIES])
        setProducts(DEFAULT_PRODUCTS.map(p => sanitizeProduct(p)))
        setCustomers(DEFAULT_CUSTOMERS.map(c => sanitizeCustomer(c)))
        setSuppliers(DEFAULT_SUPPLIERS.map(s => sanitizeSupplier(s)))
        setBills([])
        setPurchases([])
        setStockAdjustments([])
        setAgencies([])
        setAgencySales([])
        setCloudLoaded(false)
        localStorage.clear()
      }
    })
    return unsub
  }, [cloudLoaded])

  // Auto-save to Firestore when any data changes (debounced)
  const saveToCloud = useCallback(() => {
    const user = auth.currentUser
    if (!user || !cloudLoaded) return

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'stores', user.uid), {
          profile, categories, products, customers, suppliers,
          bills, purchases, stockAdjustments, agencies, agencySales,
          lastUpdated: new Date().toISOString(),
        }, { merge: true })
      } catch (err) {
        console.error('Cloud save error:', err)
      }
    }, 2000) // 2 second debounce
  }, [profile, categories, products, customers, suppliers, bills, purchases, stockAdjustments, agencies, agencySales, cloudLoaded])

  useEffect(() => {
    if (cloudLoaded) saveToCloud()
  }, [saveToCloud, cloudLoaded])

  const value = {
    profile,
    updateProfile: (updates) => setProfile(prev => sanitizeProfile({ ...prev, ...updates })),

    categories,
    addCategory: (name) => {
      const trimmed = String(name ?? '').trim()
      if (trimmed && !categories.includes(trimmed)) {
        setCategories(prev => [...prev, trimmed])
      }
    },
    deleteCategory: (name) => {
      setCategories(prev => prev.filter(c => c !== name))
    },

    products,
    addProduct: (p) => {
      const item = sanitizeProduct({ ...p, id: Date.now().toString() })
      if (item) setProducts(prev => [...prev, item])
    },
    updateProduct: (id, data) => {
      setProducts(prev => prev.map(p => p.id === String(id) ? sanitizeProduct({ ...data, id: String(id) }) ?? p : p))
    },
    deleteProduct: (id) => setProducts(prev => prev.filter(p => p.id !== String(id))),

    customers,
    addCustomer: (c) => {
      const cust = sanitizeCustomer({ ...c, id: Date.now().toString(), udhar: 0 })
      if (cust) {
        setCustomers(prev => [...prev, cust])
        return cust
      }
      return null
    },
    updateCustomer: (id, data) => {
      setCustomers(prev => prev.map(c => c.id === String(id) ? sanitizeCustomer({ ...c, ...data }) ?? c : c))
    },
    deleteCustomer: (id) => setCustomers(prev => prev.filter(c => c.id !== String(id))),
    settleCustomerUdhar: (id, amount) => {
      const amt = Math.max(0, parseFloat(amount) || 0)
      setCustomers(prev => prev.map(c => c.id === String(id) ? { ...c, udhar: Math.max(0, c.udhar - amt) } : c))
    },

    suppliers,
    addSupplier: (s) => {
      const sup = sanitizeSupplier({ ...s, id: Date.now().toString(), pendingPayment: 0 })
      if (sup) setSuppliers(prev => [...prev, sup])
    },
    updateSupplier: (id, data) => {
      setSuppliers(prev => prev.map(s => s.id === String(id) ? sanitizeSupplier({ ...s, ...data }) ?? s : s))
    },
    deleteSupplier: (id) => setSuppliers(prev => prev.filter(s => s.id !== String(id))),
    settleSupplierPayment: (id, amount) => {
      const amt = Math.max(0, parseFloat(amount) || 0)
      setSuppliers(prev => prev.map(s => s.id === String(id) ? { ...s, pendingPayment: Math.max(0, s.pendingPayment - amt) } : s))
    },

    bills,
    processBill: (billData, originalId = null, originalDate = null) => {
      if (!billData || !Array.isArray(billData.items) || billData.items.length === 0) return null

      // Reduce stock
      setProducts(prev => {
        const updated = prev.map(p => ({ ...p }))
        billData.items.forEach(item => {
          const idx = updated.findIndex(p => p.id === String(item.id))
          if (idx !== -1) updated[idx].stock = Math.max(0, updated[idx].stock - (parseFloat(item.quantity) || 0))
        })
        return updated
      })

      // Add udhar if needed
      if (billData.paymentMode === 'Udhar' && billData.customerId) {
        const amt = Math.max(0, parseFloat(billData.udharAmount) || 0)
        setCustomers(prev => prev.map(c => c.id === String(billData.customerId) ? { ...c, udhar: c.udhar + amt } : c))
      }

      const bill = sanitizeBill({
        ...billData,
        id: originalId || 'BILL-' + Date.now().toString().slice(-6),
        date: originalDate || new Date().toISOString(),
        status: 'active',
      })
      if (bill) {
        setBills(prev => [bill, ...prev.filter(b => b.id !== originalId)])
        return bill
      }
      return null
    },
    voidBill: (billId) => {
      setBills(prev => prev.map(b => {
        if (b.id === billId && b.status !== 'void') {
          // Restore stock for voided bill
          setProducts(prods => {
            const updated = prods.map(p => ({ ...p }))
            b.items.forEach(item => {
              const idx = updated.findIndex(p => p.id === String(item.id))
              if (idx !== -1) updated[idx].stock += parseFloat(item.quantity) || 0
            })
            return updated
          })
          // Remove udhar if was Udhar bill
          if (b.paymentMode === 'Udhar' && b.customerId) {
            setCustomers(custs => custs.map(c => c.id === String(b.customerId) ? { ...c, udhar: Math.max(0, c.udhar - b.total) } : c))
          }
          return { ...b, status: 'void' }
        }
        return b
      }))
    },
    deleteBill: (billId) => {
      let billToDelete = null;
      setBills(prev => {
        billToDelete = prev.find(b => b.id === String(billId))
        return prev.filter(b => b.id !== String(billId))
      })

      const targetBill = bills.find(b => b.id === String(billId)) || billToDelete
      if (!targetBill) return

      if (targetBill.status !== 'void') {
        setProducts(prods => {
          const updated = prods.map(p => ({ ...p }))
          targetBill.items.forEach(item => {
            const idx = updated.findIndex(p => p.id === String(item.id))
            if (idx !== -1) updated[idx].stock += parseFloat(item.quantity) || 0
          })
          return updated
        })
        if (targetBill.paymentMode === 'Udhar' && targetBill.customerId) {
          setCustomers(custs => custs.map(c => c.id === String(targetBill.customerId) ? { ...c, udhar: Math.max(0, c.udhar - targetBill.total) } : c))
        }
      }
    },

    purchases,
    processPurchase: (purchaseData) => {
      if (!purchaseData || !Array.isArray(purchaseData.items)) return

      // Increase stock
      setProducts(prev => {
        const updated = prev.map(p => ({ ...p }))
        purchaseData.items.forEach(item => {
          const idx = updated.findIndex(p => p.id === String(item.productId))
          if (idx !== -1) updated[idx].stock += Math.max(0, parseFloat(item.quantity) || 0)
        })
        return updated
      })

      // Add pending payment to supplier
      if (purchaseData.pendingAmount > 0 && purchaseData.supplierId) {
        const amt = Math.max(0, parseFloat(purchaseData.pendingAmount) || 0)
        setSuppliers(prev => prev.map(s => s.id === String(purchaseData.supplierId) ? { ...s, pendingPayment: s.pendingPayment + amt } : s))
      }

      const purchase = sanitizePurchase({
        ...purchaseData,
        id: 'PUR-' + Date.now().toString().slice(-6),
        date: new Date().toISOString(),
      })
      if (purchase) setPurchases(prev => [purchase, ...prev])
    },

    stockAdjustments,
    addStockAdjustment: (adjustment) => {
      const adj = sanitizeStockAdjustment({ ...adjustment, id: Date.now().toString(), date: new Date().toISOString() })
      if (!adj) return

      // Update product stock
      setProducts(prev => prev.map(p => {
        if (p.id === adj.productId) {
          const newStock = adj.type === 'add'
            ? p.stock + adj.quantity
            : Math.max(0, p.stock - adj.quantity)
          return { ...p, stock: newStock }
        }
        return p
      }))

      setStockAdjustments(prev => [adj, ...prev])
    },

    // Agency management
    agencies,
    addAgency: (a) => {
      const agency = sanitizeAgency({ ...a, id: Date.now().toString(), createdAt: new Date().toISOString() })
      if (agency) setAgencies(prev => [...prev, agency])
    },
    updateAgency: (id, data) => {
      setAgencies(prev => prev.map(a => a.id === String(id) ? sanitizeAgency({ ...a, ...data }) ?? a : a))
    },
    deleteAgency: (id) => {
      setAgencies(prev => prev.filter(a => a.id !== String(id)))
      setAgencySales(prev => prev.filter(s => s.agencyId !== String(id)))
    },

    agencySales,
    addAgencySale: (sale) => {
      const s = sanitizeAgencySale({ ...sale, id: Date.now().toString() })
      if (s) setAgencySales(prev => [s, ...prev])
    },
    updateAgencySale: (id, data) => {
      setAgencySales(prev => prev.map(s => s.id === String(id) ? sanitizeAgencySale({ ...s, ...data }) ?? s : s))
    },
    deleteAgencySale: (id) => setAgencySales(prev => prev.filter(s => s.id !== String(id))),

    // Data backup & restore
    exportAllData: () => {
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        profile: loadFromStorage('ggms_profile', DEFAULT_PROFILE),
        categories: loadFromStorage('ggms_categories', DEFAULT_CATEGORIES),
        products: loadFromStorage('ggms_products', DEFAULT_PRODUCTS),
        customers: loadFromStorage('ggms_customers', DEFAULT_CUSTOMERS),
        suppliers: loadFromStorage('ggms_suppliers', DEFAULT_SUPPLIERS),
        bills: loadFromStorage('ggms_bills', []),
        purchases: loadFromStorage('ggms_purchases', []),
        stockAdjustments: loadFromStorage('ggms_stock_adjustments', []),
        agencies: loadFromStorage('ggms_agencies', []),
        agencySales: loadFromStorage('ggms_agency_sales', []),
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `GGMS_Backup_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    importAllData: (jsonData) => {
      try {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
        if (!data || !data.version) throw new Error('Invalid backup file')

        if (data.profile) setProfile(sanitizeProfile(data.profile))
        if (data.categories) setCategories(sanitizeCategories(data.categories))
        if (data.products) setProducts(sanitizeArray(data.products, sanitizeProduct))
        if (data.customers) setCustomers(sanitizeArray(data.customers, sanitizeCustomer))
        if (data.suppliers) setSuppliers(sanitizeArray(data.suppliers, sanitizeSupplier))
        if (data.bills) setBills(sanitizeArray(data.bills, sanitizeBill))
        if (data.purchases) setPurchases(sanitizeArray(data.purchases, sanitizePurchase))
        if (data.stockAdjustments) setStockAdjustments(sanitizeArray(data.stockAdjustments, sanitizeStockAdjustment))
        if (data.agencies) setAgencies(sanitizeArray(data.agencies, sanitizeAgency))
        if (data.agencySales) setAgencySales(sanitizeArray(data.agencySales, sanitizeAgencySale))

        return true
      } catch (err) {
        console.error('Import failed:', err)
        return false
      }
    },
    resetAllData: () => {
      setProfile(sanitizeProfile(DEFAULT_PROFILE))
      setCategories([...DEFAULT_CATEGORIES])
      setProducts(DEFAULT_PRODUCTS.map(p => sanitizeProduct(p)))
      setCustomers(DEFAULT_CUSTOMERS.map(c => sanitizeCustomer(c)))
      setSuppliers(DEFAULT_SUPPLIERS.map(s => sanitizeSupplier(s)))
      setBills([])
      setPurchases([])
      setStockAdjustments([])
      setAgencies([])
      setAgencySales([])
    },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)
