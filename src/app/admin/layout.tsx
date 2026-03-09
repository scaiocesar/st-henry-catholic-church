'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-xl font-semibold text-[var(--secondary)]">
                St Henry CMS
              </Link>
              <div className="flex gap-4">
                <Link href="/admin/home" className="text-gray-600 hover:text-[var(--primary)]">Home</Link>
                <Link href="/admin/about" className="text-gray-600 hover:text-[var(--primary)]">Sections</Link>
                <Link href="/admin/location" className="text-gray-600 hover:text-[var(--primary)]">Locations</Link>
                <Link href="/admin/schedule" className="text-gray-600 hover:text-[var(--primary)]">Mass Schedule</Link>
                <Link href="/admin/special" className="text-gray-600 hover:text-[var(--primary)]">Special Masses</Link>
                <Link href="/admin/gallery" className="text-gray-600 hover:text-[var(--primary)]">Gallery</Link>
                <Link href="/admin/social" className="text-gray-600 hover:text-[var(--primary)]">Social Links</Link>
                <Link href="/admin/settings" className="text-gray-600 hover:text-[var(--primary)]">Settings</Link>
                <Link href="/admin/seo" className="text-gray-600 hover:text-[var(--primary)]">SEO</Link>
                <Link href="/admin/password" className="text-gray-600 hover:text-[var(--primary)]">Password</Link>
                <Link href="/admin/palette" className="text-gray-600 hover:text-[var(--primary)]">Theme</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-[var(--primary)] hover:underline">View Site</Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-5 py-8">
        {children}
      </main>
    </div>
  )
}
