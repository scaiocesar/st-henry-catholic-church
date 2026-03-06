'use client'

import { useEffect, useRef, useState } from 'react'

interface Settings {
  parishName: string
  parishLogo: string
  footerHours: string
  footerLocation: string
  footerContact: string
}

const DEFAULT_SETTINGS: Settings = {
  parishName: 'St Henry Catholic Church',
  parishLogo: 'http://44.202.215.36/wp-content/uploads/2026/02/Asset-2@300x-8.png',
  footerHours: 'Mon - Fri: 9 AM - 6 PM\nSat: 9 AM - 5 PM\nSun: 10 AM - 5 PM',
  footerLocation: '380 S 200 E\nBrigham City, UT 84302',
  footerContact: '(435) 723-2941\nSthenrys@comcast.net',
}

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/home')
      const data = await res.json()
      const settingsMap: Record<string, string> = {}
      data.forEach((item: { key: string; value: string }) => {
        settingsMap[item.key] = item.value
      })
      setSettings({
        parishName: settingsMap.parishName || settingsMap.churchName || DEFAULT_SETTINGS.parishName,
        parishLogo: settingsMap.parishLogo || settingsMap.churchLogo || DEFAULT_SETTINGS.parishLogo,
        footerHours: settingsMap.footerHours || DEFAULT_SETTINGS.footerHours,
        footerLocation: settingsMap.footerLocation || DEFAULT_SETTINGS.footerLocation,
        footerContact: settingsMap.footerContact || DEFAULT_SETTINGS.footerContact,
      })
      setLoading(false)
    })()
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
    setSaved(false)
  }

  const handleLogoUpload = () => {
    fileInputRef.current?.click()
  }

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setSettings((prev) => ({ ...prev, parishLogo: data.url }))
      setSaved(false)
    } catch {
      alert('Failed to upload logo')
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const payloads = [
      { key: 'parishName', value: settings.parishName },
      { key: 'parishLogo', value: settings.parishLogo },
      // Backward compatibility keys
      { key: 'churchName', value: settings.parishName },
      { key: 'churchLogo', value: settings.parishLogo },
      { key: 'footerHours', value: settings.footerHours },
      { key: 'footerLocation', value: settings.footerLocation },
      { key: 'footerContact', value: settings.footerContact },
    ]

    for (const payload of payloads) {
      await fetch('/api/home', {
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
        onChange={handleLogoFileChange}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Site Settings</h1>
        {saved && <span className="text-green-600 font-medium">Saved successfully!</span>}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow max-w-3xl space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-6">Parish Identity</h2>
        
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parish Name</label>
              <input
                type="text"
                value={settings.parishName}
                onChange={(e) => handleChange('parishName', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parish Logo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.parishLogo}
                  onChange={(e) => handleChange('parishLogo', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  placeholder="/uploads/logo.png"
                />
                <button
                  type="button"
                  onClick={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="px-4 bg-[var(--primary)] text-white rounded hover:opacity-90 disabled:opacity-50"
                >
                  {uploadingLogo ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {settings.parishLogo && (
                <div className="mt-2 p-4 bg-gray-50 rounded flex items-center gap-4">
                  <img src={settings.parishLogo} alt="Logo preview" className="h-16 object-contain" />
                  <span className="text-sm text-gray-500">Logo preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">Footer Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <textarea
                value={settings.footerHours}
                onChange={(e) => handleChange('footerHours', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <textarea
                value={settings.footerLocation}
                onChange={(e) => handleChange('footerLocation', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <textarea
                value={settings.footerContact}
                onChange={(e) => handleChange('footerContact', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                rows={3}
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
