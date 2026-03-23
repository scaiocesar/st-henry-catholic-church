'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/users" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-[var(--secondary)] mb-2">Admin users</h2>
          <p className="text-gray-600">Create, edit, or remove CMS administrators</p>
        </Link>
        <Link href="/admin/schedule" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-[var(--secondary)] mb-2">Mass Schedule</h2>
          <p className="text-gray-600">Manage regular mass times</p>
        </Link>
        <Link href="/admin/special" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-[var(--secondary)] mb-2">Special Masses</h2>
          <p className="text-gray-600">Manage special events and masses</p>
        </Link>
        <Link href="/admin/gallery" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-[var(--secondary)] mb-2">Photo Gallery</h2>
          <p className="text-gray-600">Manage gallery photos</p>
        </Link>
        <Link href="/admin/social" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-[var(--secondary)] mb-2">Social Links</h2>
          <p className="text-gray-600">Manage social media links</p>
        </Link>
      </div>
    </div>
  )
}
