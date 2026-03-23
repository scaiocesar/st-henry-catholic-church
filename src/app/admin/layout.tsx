'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '◉' },
  { href: '/admin/home', label: 'Home', icon: '⌂' },
  { href: '/admin/about', label: 'Sections', icon: '☰' },
  { href: '/admin/location', label: 'Locations', icon: '◉' },
  { href: '/admin/schedule', label: 'Mass Schedule', icon: '◷' },
  { href: '/admin/special', label: 'Special Masses', icon: '★' },
  { href: '/admin/gallery', label: 'Gallery', icon: '◻' },
  { href: '/admin/bulletin', label: 'Bulletins', icon: '◫' },
  { href: '/admin/social', label: 'Social Links', icon: '🔗' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
  { href: '/admin/seo', label: 'SEO', icon: '◎' },
  { href: '/admin/password', label: 'Password', icon: '🔒' },
  { href: '/admin/users', label: 'Admin users', icon: '👤' },
  { href: '/admin/palette', label: 'Theme', icon: '◐' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth')
        const data = await res.json()
        if (!mounted) return
        if (!data.authenticated) {
          router.push('/login')
        } else {
          setIsAuthenticated(true)
        }
      } catch {
        if (mounted) {
          router.push('/login')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[var(--secondary)] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && (
            <Link href="/admin" className="text-lg font-semibold">
              St Henry CMS
            </Link>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-white/10 rounded"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition ${
                  isActive ? 'bg-white/20 border-r-4 border-[var(--primary)]' : ''
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          {sidebarOpen && (
            <div className="flex flex-col gap-2 mb-4">
              <Link 
                href="/" 
                className="text-sm text-center py-2 bg-white/10 hover:bg-white/20 rounded transition"
              >
                View Site
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm text-center py-2 bg-red-500/80 hover:bg-red-600 rounded transition"
              >
                Logout
              </button>
            </div>
          )}
          {!sidebarOpen && (
            <button 
              onClick={handleLogout}
              className="w-full p-2 text-center hover:bg-white/10 rounded"
              title="Logout"
            >
              ⏻
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
