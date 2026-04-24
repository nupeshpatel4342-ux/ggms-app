import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex bg-slate-100 min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 h-screen overflow-y-auto">
        <div className="page-enter">{children}</div>
      </main>
    </div>
  )
}
