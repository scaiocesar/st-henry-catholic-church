'use client'

import { useState, useEffect } from 'react'

interface SocialLink {
  id: number
  platform: string
  url: string
  icon: string | null
  isActive: boolean
  sortOrder: number
}

const PLATFORMS = [
  { key: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
  { key: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E4405F' },
  { key: 'youtube', name: 'YouTube', icon: 'youtube', color: '#FF0000' },
  { key: 'tiktok', name: 'TikTok', icon: 'tiktok', color: '#000000' },
  { key: 'x', name: 'X (Twitter)', icon: 'twitter-x', color: '#000000' },
]

export default function SocialAdmin() {
  const [links, setLinks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    const res = await fetch('/api/social')
    const data: SocialLink[] = await res.json()
    const linkMap: Record<string, string> = {}
    data.forEach((link) => {
      linkMap[link.platform.toLowerCase()] = link.url
    })
    setLinks(linkMap)
    setLoading(false)
  }

  const handleChange = (platform: string, url: string) => {
    setLinks({ ...links, [platform]: url })
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Delete existing links that are now empty
    const existing = await fetch('/api/social').then(r => r.json()) as SocialLink[]
    for (const link of existing) {
      const key = link.platform.toLowerCase()
      if (!links[key] || links[key].trim() === '') {
        await fetch(`/api/social/${link.id}`, { method: 'DELETE' })
      }
    }
    
    // Create or update links
    for (const platform of PLATFORMS) {
      const url = links[platform.key]?.trim()
      if (url) {
        const existingLink = existing.find(l => l.platform.toLowerCase() === platform.key)
        if (existingLink) {
          await fetch(`/api/social/${existingLink.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, sortOrder: PLATFORMS.indexOf(platform) })
          })
        } else {
          await fetch('/api/social', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              platform: platform.key, 
              url, 
              icon: platform.key,
              sortOrder: PLATFORMS.indexOf(platform)
            })
          })
        }
      }
    }
    
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Social Media Links</h1>
        {saved && <span className="text-green-600 font-medium">Saved successfully!</span>}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 mb-6">Enter the URLs for your social media profiles. Leave empty to hide.</p>
        
        <div className="space-y-4">
          {PLATFORMS.map((platform) => (
            <div key={platform.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: platform.color }}
              >
                {platform.key === 'facebook' && 'f'}
                {platform.key === 'instagram' && '📷'}
                {platform.key === 'youtube' && '▶'}
                {platform.key === 'tiktok' && '♪'}
                {platform.key === 'x' && '𝕏'}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{platform.name}</label>
                <input
                  type="url"
                  value={links[platform.key] || ''}
                  onChange={(e) => handleChange(platform.key, e.target.value)}
                  placeholder={`https://${platform.key === 'x' ? 'x.com' : platform.key + '.com'}/yourpage`}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 bg-[var(--primary)] text-white px-6 py-2 rounded font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Links'}
        </button>
      </div>
    </div>
  )
}
