'use client'

import { useState, useEffect, useRef } from 'react'

interface Bulletin {
  id: number
  title: string
  url: string
  s3Key: string | null
  description: string | null
  isActive: boolean
  isCurrent: boolean
  publishDate: string
  sortOrder: number
}

export default function BulletinAdmin() {
  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [form, setForm] = useState({ title: '', description: '', isCurrent: false })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchBulletins()
  }, [])

  const fetchBulletins = async () => {
    const res = await fetch('/api/bulletin')
    const data = await res.json()
    setBulletins(data)
    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const uploadToS3 = async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    if (!res.ok) {
      throw new Error('Upload failed')
    }
    
    return res.json()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      if (!file) {
        alert('Please select a PDF file')
        setUploading(false)
        return
      }

      const result = await uploadToS3(file)

      await fetch('/api/bulletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          url: result.url,
          s3Key: result.filename,
          isCurrent: form.isCurrent,
        })
      })

      setForm({ title: '', description: '', isCurrent: false })
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      fetchBulletins()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to upload')
    } finally {
      setUploading(false)
    }
  }

  const handleToggleActive = async (bulletin: Bulletin) => {
    await fetch(`/api/bulletin/${bulletin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...bulletin,
        isActive: !bulletin.isActive,
      })
    })
    fetchBulletins()
  }

  const handleSetCurrent = async (bulletin: Bulletin) => {
    await fetch(`/api/bulletin/${bulletin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...bulletin,
        isCurrent: true,
      })
    })
    fetchBulletins()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this bulletin? This will also remove it from S3 storage.')) return
    await fetch(`/api/bulletin/${id}`, { method: 'DELETE' })
    fetchBulletins()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Weekly Bulletin Management</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload New Bulletin</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              />
              {file && <p className="text-sm text-green-600 mt-1">Selected: {file.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., March 9, 2025"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={form.isCurrent}
                onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                className="w-4 h-4 text-[var(--primary)]"
              />
              <label htmlFor="isCurrent" className="text-sm font-medium text-gray-700">
                Set as current bulletin
              </label>
            </div>
            <button 
              type="submit" 
              disabled={uploading}
              className="w-full bg-[var(--primary)] text-white py-2 rounded hover:bg-[#5ab0d4] transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Bulletin'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Existing Bulletins</h2>
          {bulletins.length === 0 ? (
            <p className="text-gray-500">No bulletins yet</p>
          ) : (
            <div className="space-y-3">
              {bulletins.map((bulletin) => (
                <div 
                  key={bulletin.id} 
                  className={`p-4 rounded-lg border ${bulletin.isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{bulletin.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(bulletin.publishDate).toLocaleDateString()}
                      </p>
                      {bulletin.description && (
                        <p className="text-sm text-gray-600 mt-1">{bulletin.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleToggleActive(bulletin)}
                        className={`text-xs px-2 py-1 rounded ${bulletin.isActive ? 'bg-green-500' : 'bg-gray-400'} text-white`}
                      >
                        {bulletin.isActive ? 'Active' : 'Inactive'}
                      </button>
                      {!bulletin.isCurrent && bulletin.isActive && (
                        <button
                          onClick={() => handleSetCurrent(bulletin)}
                          className="text-xs px-2 py-1 rounded bg-blue-500 text-white"
                        >
                          Set Current
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(bulletin.id)}
                        className="text-xs px-2 py-1 rounded bg-red-500 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {bulletin.isCurrent && (
                    <span className="inline-block mt-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                      Current Bulletin
                    </span>
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
