'use client'

import { useState, useRef, useEffect } from 'react'

interface HomeContent {
  key: string
  value: string
  description: string | null
}

export default function HomeAdmin() {
  const [contents, setContents] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultContent = {
    parishName: 'St Henry Catholic Church',
    parishLogo: 'http://44.202.215.36/wp-content/uploads/2026/02/Asset-2@300x-8.png',
    heroTitle: 'Welcome to St Henry Catholic Church',
    heroSubtitle: 'Experience a vibrant community of faith where all are welcome. Join us for uplifting Mass services in both English and Spanish.',
    heroImage: 'http://44.202.215.36/wp-content/uploads/2026/02/image.jpg',
    welcomeTitle: 'Discover Our Vibrant Parish Community',
    welcomeText: 'St Henry Catholic Church serves as a beacon of faith and community in Brigham City, Utah. As a welcoming parish, we pride ourselves on creating an inclusive environment where individuals and families can come together in worship.'
  }

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    const res = await fetch('/api/home')
    const data: HomeContent[] = await res.json()
    const contentMap: Record<string, string> = {}
    data.forEach((item) => {
      contentMap[item.key] = item.value
    })
    setContents({ ...defaultContent, ...contentMap })
    setLoading(false)
  }

  const handleChange = (key: string, value: string) => {
    setContents({ ...contents, [key]: value })
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    for (const [key, value] of Object.entries(contents)) {
      await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleImageUpload = (key: string) => {
    fileInputRef.current?.setAttribute('data-target', key)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const key = e.target.getAttribute('data-target') || 'heroImage'
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      handleChange(key, data.url)
      await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: data.url }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      alert('Failed to upload image')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Home Page Management</h1>
        {saved && <span className="text-green-600 font-medium">Saved successfully!</span>}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Parish Identity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Parish Identity</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parish Name</label>
              <input
                type="text"
                value={contents.parishName || ''}
                onChange={(e) => handleChange('parishName', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                placeholder="St Henry Catholic Church"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parish Logo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={contents.parishLogo || ''}
                  onChange={(e) => handleChange('parishLogo', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  placeholder="/uploads/logo.png"
                />
                <button
                  type="button"
                  onClick={() => handleImageUpload('parishLogo')}
                  disabled={uploading}
                  className="px-4 bg-[var(--primary)] text-white rounded hover:opacity-90 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {contents.parishLogo && (
                <div className="mt-2 p-3 bg-gray-50 rounded flex items-center gap-4">
                  <img src={contents.parishLogo} alt="Parish logo preview" className="h-16 object-contain" />
                  <span className="text-sm text-gray-500">Logo preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Hero Section (Banner)</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={contents.heroTitle || ''}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
              <textarea
                value={contents.heroSubtitle || ''}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Background Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={contents.heroImage || ''}
                  onChange={(e) => handleChange('heroImage', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  placeholder="/uploads/image.jpg"
                />
                <button
                  type="button"
                  onClick={() => handleImageUpload('heroImage')}
                  disabled={uploading}
                  className="px-4 bg-[var(--primary)] text-white rounded hover:opacity-90 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {contents.heroImage && (
                <img src={contents.heroImage} alt="Hero preview" className="mt-2 h-32 w-full object-cover rounded" />
              )}
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Title</label>
              <input
                type="text"
                value={contents.welcomeTitle || ''}
                onChange={(e) => handleChange('welcomeTitle', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Text</label>
              <textarea
                value={contents.welcomeText || ''}
                onChange={(e) => handleChange('welcomeText', e.target.value)}
                rows={4}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[var(--primary)] text-white py-3 rounded font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
