'use client'

import { useState, useEffect } from 'react'

interface SpecialMass {
  id: number
  title: string
  description: string | null
  date: string
  time: string
  location: string | null
  isActive: boolean
}

interface Location {
  id: number
  name: string
}

export default function SpecialMassAdmin() {
  const [masses, setMasses] = useState<SpecialMass[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', location: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchMasses() {
    const res = await fetch('/api/special-mass')
    const data = await res.json()
    setMasses(data)
  }

  async function fetchLocations() {
    const res = await fetch('/api/location')
    const data = await res.json()
    setLocations(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await fetch(`/api/special-mass/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setEditingId(null)
    } else {
      await fetch('/api/special-mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    setForm({ title: '', description: '', date: '', time: '', location: '' })
    fetchMasses()
  }

  const handleEdit = (mass: SpecialMass) => {
    setForm({
      title: mass.title,
      description: mass.description || '',
      date: mass.date.split('T')[0],
      time: mass.time,
      location: mass.location || ''
    })
    setEditingId(mass.id)
  }

  const handleCancel = () => {
    setForm({ title: '', description: '', date: '', time: '', location: '' })
    setEditingId(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this special mass?')) return
    await fetch(`/api/special-mass/${id}`, { method: 'DELETE' })
    fetchMasses()
  }

  useEffect(() => {
    ;(async () => {
      const [massesRes, locationsRes] = await Promise.all([
        fetch('/api/special-mass'),
        fetch('/api/location'),
      ])
      const massesData = await massesRes.json()
      const locationsData = await locationsRes.json()
      setMasses(massesData)
      setLocations(locationsData)
      setLoading(false)
    })()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Special Masses Management</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Special Mass' : 'Add Special Mass / Event'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Christmas Mass"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="text"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="e.g., 10:00 am"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[var(--primary)] text-white py-2 rounded hover:bg-[#5ab0d4] transition">
                {editingId ? 'Update' : 'Add Special Mass'}
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
          <h2 className="text-xl font-semibold mb-4">Current Special Masses</h2>
          {masses.length === 0 ? (
            <p className="text-gray-500">No special masses yet</p>
          ) : (
            <ul className="space-y-3">
              {masses.map((mass) => (
                <li key={mass.id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{mass.title}</p>
                    <p className="text-sm text-gray-600">{new Date(mass.date).toLocaleDateString()} at {mass.time}</p>
                    {mass.location && <p className="text-sm text-gray-500">{mass.location}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(mass)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(mass.id)}
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
