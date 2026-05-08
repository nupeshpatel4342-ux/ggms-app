import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Package, Users, Truck, Download, FileText, Settings, Store, LogOut, User, History, Building2 } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

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
  const navigate = useNavigate()
  const { profile } = useAppContext()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
  return (
    <aside className="w-20 md:w-64 bg-[#001a38] text-white flex flex-col h-screen fixed top-0 left-0 shadow-2xl shadow-slate-950/20 z-30">
      <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 border-b border-white/10 bg-white/[0.03]">
        <div className="w-11 h-11 rounded-lg bg-[#fed488] text-[#002046] flex items-center justify-center shadow-lg shadow-black/20">
          <Store size={25} />
        </div>
        <div className="hidden md:block">
          <h1 className="text-xl font-black leading-tight tracking-tight">GGM&S</h1>
          <p className="text-[10px] uppercase tracking-widest text-[#fed488]">Retail Merchant</p>
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto px-2">
        {navItems.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              title={item.name}
              className={`relative flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 text-sm font-semibold rounded-md transition-all duration-200 animate-slide-in-left ${
                active
                  ? 'bg-white text-[#002046] shadow-lg shadow-black/10'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#fed488]" />}
              <Icon size={20} className={active ? 'text-[#c58a1d]' : ''} />
              <span className="hidden md:inline truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10">
        <Link to="/settings" className="flex items-center justify-center md:justify-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
          <div className="w-9 h-9 rounded-full bg-[#1b365d] flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white/20">
            {profile?.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-white/70" />
            )}
          </div>
          <div className="min-w-0 hidden md:block">
            <p className="text-sm font-bold text-white truncate">{profile?.ownerName || 'Store Owner'}</p>
            <p className="text-[10px] text-slate-400 truncate">{profile?.shopName || 'GGM&S Retail'}</p>
          </div>
        </Link>
        <button onClick={handleLogout} title="Logout" className="flex items-center justify-center md:justify-start gap-3 w-full px-6 py-3 text-sm text-slate-300 hover:text-[#ffb4ab] hover:bg-white/5 transition-colors">
          <LogOut size={18} /> <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  )
}
