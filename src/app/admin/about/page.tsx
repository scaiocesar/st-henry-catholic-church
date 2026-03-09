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
  { key: 'ministries', label: 'Ministries' },
]

export default function AboutAdmin() {
  const [sections, setSections] = useState<Section[]>([])
  const [category, setCategory] = useState('welcome')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

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
        title: getLabel(category),
        content,
        isActive,
        sortOrder: CATEGORIES.findIndex((item) => item.key === category),
      }),
    })
    fetchSections()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleContentChange = (value: string) => {
    setContent(value)
  }

  const isSectionEnabled = (key: string) => {
    const section = sections.find((s) => s.category === key)
    return section?.isActive ?? true
  }

  const getLabel = (key: string) => {
    return CATEGORIES.find((item) => item.key === key)?.label || key
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

      {saved && (
        <div className="mb-4 p-4 bg-green-100 border border-green-500 text-green-700 rounded-lg">
          Section saved successfully!
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
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
        <h2 className="text-xl font-semibold mb-4">Edit: {getLabel(category)}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
            <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-700">
              {getLabel(category)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Title is automatically set based on the selected category.</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
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
