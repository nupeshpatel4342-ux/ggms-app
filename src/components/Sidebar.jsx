import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Package, Users, Truck, Download, FileText, Settings, Store, LogOut, User, History, Building2 } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Billing / POS', icon: ShoppingCart, path: '/pos' },
  { name: 'Bill History', icon: History, path: '/bills' },
  { name: 'Inventory', icon: Package, path: '/inventory' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Suppliers', icon: Truck, path: '/suppliers' },
  { name: 'Agencies', icon: Building2, path: '/agencies' },
  { name: 'Purchase Entry', icon: Download, path: '/purchase' },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const { profile } = useAppContext()

  return (
    <aside className="w-64 bg-[#002046] text-white flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <Store size={28} />
        <div>
          <h1 className="text-xl font-black leading-tight tracking-tight">GGM&S</h1>
          <p className="text-[10px] uppercase tracking-widest text-[#fed488]">Retail Merchant</p>
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#1b365d] border-r-4 border-[#fed488] text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10">
        <Link to="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
          <div className="w-9 h-9 rounded-full bg-[#1b365d] flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white/20">
            {profile?.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-white/70" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{profile?.ownerName || 'Store Owner'}</p>
            <p className="text-[10px] text-slate-400 truncate">{profile?.shopName || 'GGM&S Retail'}</p>
          </div>
        </Link>
        <button className="flex items-center gap-3 w-full px-6 py-3 text-sm text-slate-300 hover:text-[#ba1a1a] hover:bg-white/5 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  )
}
