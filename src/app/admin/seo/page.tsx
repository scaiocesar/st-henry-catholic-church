'use client'

import { useEffect, useRef, useState } from 'react'

interface SeoSettings {
  keywords: string
  ogImage: string
  googleVerification: string
  twitterHandle: string
}

const DEFAULT_SEO: SeoSettings = {
  keywords: '',
  ogImage: '/og-image.jpg',
  googleVerification: '',
  twitterHandle: '@sthenryutah',
}

export default function SeoAdmin() {
  const [settings, setSettings] = useState<SeoSettings>(DEFAULT_SEO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingOg, setUploadingOg] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/seo')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          keywords: data.keywords || DEFAULT_SEO.keywords,
          ogImage: data.ogImage || DEFAULT_SEO.ogImage,
          googleVerification: data.googleVerification || DEFAULT_SEO.googleVerification,
          twitterHandle: data.twitterHandle || DEFAULT_SEO.twitterHandle,
        })
      }
      setLoading(false)
    })()
  }, [])

  const handleChange = (key: keyof SeoSettings, value: string) => {
    setSettings({ ...settings, [key]: value })
    setSaved(false)
  }

  const handleOgUpload = () => {
    fileInputRef.current?.click()
  }

  const handleOgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingOg(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setSettings((prev) => ({ ...prev, ogImage: data.url }))
      setSaved(false)
    } catch {
      alert('Failed to upload image')
    } finally {
      setUploadingOg(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const payloads = [
      { key: 'seoKeywords', value: settings.keywords },
      { key: 'seoOgImage', value: settings.ogImage },
      { key: 'seoGoogleVerification', value: settings.googleVerification },
      { key: 'seoTwitterHandle', value: settings.twitterHandle },
    ]

    for (const payload of payloads) {
      await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleOgFileChange}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">SEO Settings</h1>
        {saved && <span className="text-green-600 font-medium">Saved successfully!</span>}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow max-w-3xl space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-6">Search Engine Optimization</h2>
        
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
                <span className="text-gray-400 font-normal ml-2">(comma-separated)</span>
              </label>
              <textarea
                value={settings.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                rows={3}
                placeholder="Catholic Church, Mass times, Brigham City, ..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: Catholic Church, Mass times, Brigham City, Utah, St Henry
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Site Verification
                <span className="text-gray-400 font-normal ml-2">(optional)</span>
              </label>
              <input
                type="text"
                value={settings.googleVerification}
                onChange={(e) => handleChange('googleVerification', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                placeholder="google-site-verification-code"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">Social Media (Open Graph & Twitter)</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.ogImage}
                  onChange={(e) => handleChange('ogImage', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  placeholder="/uploads/og-image.jpg"
                />
                <button
                  type="button"
                  onClick={handleOgUpload}
                  disabled={uploadingOg}
                  className="px-4 bg-[var(--primary)] text-white rounded hover:opacity-90 disabled:opacity-50"
                >
                  {uploadingOg ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {settings.ogImage && (
                <div className="mt-2 p-4 bg-gray-50 rounded">
                  <img src={settings.ogImage} alt="OG Image preview" className="max-w-md w-full h-auto rounded" />
                  <span className="text-sm text-gray-500 block mt-1">Preview (1200x630 recommended)</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Handle</label>
              <input
                type="text"
                value={settings.twitterHandle}
                onChange={(e) => handleChange('twitterHandle', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                placeholder="@sthenryutah"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--primary)] text-white px-6 py-2 rounded font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
