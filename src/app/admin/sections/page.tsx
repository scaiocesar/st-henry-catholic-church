'use client'

import { useState, useEffect } from 'react'
import HtmlEditor from '@/components/HtmlEditor'

interface Section {
  id: number
  category: string
  title: string | null
  content: string
  isActive: boolean
  sortOrder: number
}

const CATEGORIES = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'history', label: 'History' },
  { key: 'about', label: 'About' },
  { key: 'sacraments', label: 'Sacraments' },
  { key: 'events', label: 'Events' },
  { key: 'ministries', label: 'Ministries' }
]

export default function SectionsAdmin() {
  const [sections, setSections] = useState<Section[]>([])
  const [category, setCategory] = useState('welcome')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)

  async function fetchSections() {
    const res = await fetch('/api/section')
    const data = await res.json()
    setSections(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        title,
        content,
        isActive,
        sortOrder: CATEGORIES.findIndex((item) => item.key === category),
      })
    })
    fetchSections()
  }

  const handleContentChange = (value: string) => {
    setContent(value)
  }

  const getCategoryLabel = (key: string) => {
    return CATEGORIES.find(c => c.key === key)?.label || key
  }

  const isSectionEnabled = (key: string) => {
    const section = sections.find((s) => s.category === key)
    return section?.isActive ?? true
  }

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/section')
      const data: Section[] = await res.json()
      setSections(data)
      const existing = data.find((s) => s.category === category)
      setTitle(existing?.title || '')
      setContent(existing?.content || '')
      setIsActive(existing?.isActive ?? true)
      setLoading(false)
    })()
  }, [])

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    const existing = sections.find((s) => s.category === newCategory)
    setTitle(existing?.title || '')
    setContent(existing?.content || '')
    setIsActive(existing?.isActive ?? true)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Sections Management</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`p-4 rounded-lg text-center font-medium transition ${
              category === cat.key 
                ? 'bg-[var(--primary)] text-white' 
                : 'bg-white border-2 border-gray-200 hover:border-[var(--primary)]'
            }`}
          >
            {cat.label}
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded ${
                isSectionEnabled(cat.key) ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isSectionEnabled(cat.key) ? 'ON' : 'OFF'}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Edit: {getCategoryLabel(category)}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter title for ${getCategoryLabel(category)}`}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 border rounded">
            <div>
              <p className="text-sm font-medium text-gray-700">Section Status</p>
              <p className="text-xs text-gray-500">Disable to hide this section on public pages.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className={`px-4 py-2 rounded text-sm font-medium ${
                isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {isActive ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
            <HtmlEditor value={content} onChange={handleContentChange} />
          </div>
          <button
            type="submit"
            className="bg-[var(--primary)] text-white px-6 py-2 rounded font-medium hover:opacity-90 transition"
          >
            Save Section
          </button>
        </form>
      </div>
    </div>
  )
}
