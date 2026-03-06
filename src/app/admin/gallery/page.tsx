'use client'

import { useState, useEffect } from 'react'

interface GalleryPhoto {
  id: number
  title: string | null
  url: string
  description: string | null
  isActive: boolean
  sortOrder: number
}

export default function GalleryAdmin() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [form, setForm] = useState({ title: '', url: '', description: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    const res = await fetch('/api/gallery')
    const data = await res.json()
    setPhotos(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await fetch(`/api/gallery/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setEditingId(null)
    } else {
      await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    setForm({ title: '', url: '', description: '' })
    fetchPhotos()
  }

  const handleEdit = (photo: GalleryPhoto) => {
    setForm({
      title: photo.title || '',
      url: photo.url,
      description: photo.description || ''
    })
    setEditingId(photo.id)
  }

  const handleCancel = () => {
    setForm({ title: '', url: '', description: '' })
    setEditingId(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this photo?')) return
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    fetchPhotos()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Photo Gallery Management</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Photo' : 'Add Photo'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Photo title"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Photo description"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[var(--primary)] text-white py-2 rounded hover:bg-[#5ab0d4] transition">
                {editingId ? 'Update' : 'Add Photo'}
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
          <h2 className="text-xl font-semibold mb-4">Current Photos</h2>
          {photos.length === 0 ? (
            <p className="text-gray-500">No photos yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img 
                    src={photo.url} 
                    alt={photo.title || 'Gallery'} 
                    className="w-full h-24 object-cover rounded"
                  />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(photo)}
                      className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                  {photo.title && (
                    <p className="text-xs text-gray-600 mt-1 truncate">{photo.title}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
