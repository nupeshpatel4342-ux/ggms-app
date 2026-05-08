import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex app-bg min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8 h-screen overflow-y-auto">
        <div className="page-enter max-w-[1680px] mx-auto">{children}</div>
      </main>
    </div>
  )
}
