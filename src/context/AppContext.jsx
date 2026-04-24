import { createContext, useContext, useState, useEffect } from 'react'

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
  }
}

function sanitizeSupplier(s) {
  if (!s || typeof s !== 'object') return null
  return {
    id: String(s.id ?? Date.now()),
    name: String(s.name ?? 'Unknown Supplier'),
    contact: String(s.contact ?? ''),
    pendingPayment: Math.max(0, parseFloat(s.pendingPayment) || 0),
  }
}

function sanitizeBillItem(item) {
  if (!item || typeof item !== 'object') return null
  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? 'Item'),
    sellingPrice: Math.max(0, parseFloat(item.sellingPrice) || 0),
    quantity: Math.max(1, parseInt(item.quantity) || 1),
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
    items,
    customerId: b.customerId ? String(b.customerId) : null,
    paymentMode: ['Cash', 'UPI', 'Udhar'].includes(b.paymentMode) ? b.paymentMode : 'Cash',
    subtotal: Math.max(0, parseFloat(b.subtotal) || 0),
    tax: Math.max(0, parseFloat(b.tax) || 0),
    discount: Math.max(0, parseFloat(b.discount) || 0),
    total: Math.max(0, parseFloat(b.total) || 0),
    udharAmount: Math.max(0, parseFloat(b.udharAmount) || 0),
  }
}

function sanitizePurchaseItem(item) {
  if (!item || typeof item !== 'object') return null
  return {
    productId: String(item.productId ?? ''),
    name: String(item.name ?? 'Item'),
    quantity: Math.max(0, parseInt(item.quantity) || 0),
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
  { id: '1', name: 'Premium Basmati Rice', category: 'Grocery', purchasePrice: 80, sellingPrice: 110, stock: 120, unit: 'kg', barcode: '890123456001' },
  { id: '2', name: 'Refined Sunflower Oil', category: 'Oil', purchasePrice: 130, sellingPrice: 155, stock: 45, unit: 'liter', barcode: '890123456002' },
  { id: '3', name: 'Tata Salt', category: 'Grocery', purchasePrice: 18, sellingPrice: 24, stock: 80, unit: 'kg', barcode: '890123456003' },
  { id: '4', name: 'Aashirvaad Atta 5kg', category: 'Grocery', purchasePrice: 190, sellingPrice: 230, stock: 3, unit: 'pcs', barcode: '890123456004' },
  { id: '5', name: 'Haldiram Moong Dal', category: 'Snacks', purchasePrice: 35, sellingPrice: 50, stock: 10, unit: 'pcs', barcode: '890123456005' },
]

const DEFAULT_CUSTOMERS = [
  { id: '1', name: 'Rahul Sharma', mobile: '9876543210', address: '', udhar: 1250 },
  { id: '2', name: 'Sneha Patel', mobile: '9123456780', address: '', udhar: 0 },
  { id: '3', name: 'Amit Singh', mobile: '9988776655', address: '', udhar: 450 },
]

const DEFAULT_SUPPLIERS = [
  { id: '1', name: 'Agrawal Distributors', contact: '9000100011', pendingPayment: 5400 },
  { id: '2', name: 'MegaMart Wholesale', contact: '9000100022', pendingPayment: 0 },
]

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

  useEffect(() => saveToStorage('ggms_profile', profile), [profile])
  useEffect(() => saveToStorage('ggms_categories', categories), [categories])
  useEffect(() => saveToStorage('ggms_products', products), [products])
  useEffect(() => saveToStorage('ggms_customers', customers), [customers])
  useEffect(() => saveToStorage('ggms_suppliers', suppliers), [suppliers])
  useEffect(() => saveToStorage('ggms_bills', bills), [bills])
  useEffect(() => saveToStorage('ggms_purchases', purchases), [purchases])

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

    bills,
    processBill: (billData) => {
      if (!billData || !Array.isArray(billData.items) || billData.items.length === 0) return null

      // Reduce stock
      setProducts(prev => {
        const updated = prev.map(p => ({ ...p }))
        billData.items.forEach(item => {
          const idx = updated.findIndex(p => p.id === String(item.id))
          if (idx !== -1) updated[idx].stock = Math.max(0, updated[idx].stock - (parseInt(item.quantity) || 0))
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
        id: 'BILL-' + Date.now().toString().slice(-6),
        date: new Date().toISOString(),
      })
      if (bill) {
        setBills(prev => [bill, ...prev])
        return bill
      }
      return null
    },

    purchases,
    processPurchase: (purchaseData) => {
      if (!purchaseData || !Array.isArray(purchaseData.items)) return

      // Increase stock
      setProducts(prev => {
        const updated = prev.map(p => ({ ...p }))
        purchaseData.items.forEach(item => {
          const idx = updated.findIndex(p => p.id === String(item.productId))
          if (idx !== -1) updated[idx].stock += Math.max(0, parseInt(item.quantity) || 0)
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
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)
