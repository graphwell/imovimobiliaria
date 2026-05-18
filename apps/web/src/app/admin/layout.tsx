'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { getToken, clearToken, adminApi } from '../../lib/admin-api'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/imoveis', label: 'Imóveis', icon: '🏠' },
  { href: '/admin/leads', label: 'Leads', icon: '👥' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ nome: string; email: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') return
    const token = getToken()
    if (!token) { router.push('/admin/login'); return }
    adminApi.me()
      .then(res => setUser(res.data))
      .catch(() => { router.push('/admin/login') })
  }, [pathname, router])

  async function handleLogout() {
    await adminApi.logout().catch(() => {})
    clearToken()
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-neutral-200 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-neutral-200">
          <Link href="/admin/dashboard">
            <Image src="/logo.png" alt="IMOV" width={120} height={40} className="h-8 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-200">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-neutral-900 truncate">{user?.nome}</p>
            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 hover:text-danger-600 transition-colors"
          >
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 h-14 flex items-center justify-between lg:justify-end">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <Link href="/" target="_blank" className="text-sm text-neutral-500 hover:text-brand-500 transition-colors">
            Ver site ↗
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
