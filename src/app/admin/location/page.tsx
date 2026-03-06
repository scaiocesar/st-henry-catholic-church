'use client'

import { useState, useEffect } from 'react'

interface Location {
  id: number
  name: string
  address: string | null
  isActive: boolean
  sortOrder: number
}

export default function LocationAdmin() {
  const [locations, setLocations] = useState<Location[]>([])
  const [form, setForm] = useState({ name: '', address: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    const res = await fetch('/api/location')
    const data = await res.json()
    setLocations(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await fetch(`/api/location/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setEditingId(null)
    } else {
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    setForm({ name: '', address: '' })
    fetchLocations()
  }

  const handleEdit = (location: Location) => {
    setForm({
      name: location.name,
      address: location.address || ''
    })
    setEditingId(location.id)
  }

  const handleCancel = () => {
    setForm({ name: '', address: '' })
    setEditingId(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this location?')) return
    await fetch(`/api/location/${id}`, { method: 'DELETE' })
    fetchLocations()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Location Management</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Location' : 'Add New Location'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., St Henry Church, Santa Ana Mission"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g., 380 S 200 E, Brigham City, UT"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[var(--primary)] text-white py-2 rounded hover:bg-[#5ab0d4] transition">
                {editingId ? 'Update' : 'Add Location'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} className="px-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Locations</h2>
          {locations.length === 0 ? (
            <p className="text-gray-500">No locations yet</p>
          ) : (
            <ul className="space-y-3">
              {locations.map((location) => (
                <li key={location.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{location.name}</p>
                    {location.address && <p className="text-sm text-gray-600">{location.address}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(location)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(location.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
