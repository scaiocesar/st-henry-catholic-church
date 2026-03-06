'use client'

import { useState, useEffect } from 'react'
import { colorPalettes, PaletteKey } from '@/lib/palettes'

interface PaletteData {
  key: string
  name: string
  primary: string
  accent: string
  background: string
  text: string
  secondaryBg: string
}

export default function PaletteAdmin() {
  const [selectedPalette, setSelectedPalette] = useState<string>('default')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchPalette()
  }, [])

  const fetchPalette = async () => {
    const res = await fetch('/api/palette')
    const data = await res.json()
    setSelectedPalette(data.key || 'default')
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/palette', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paletteKey: selectedPalette })
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Color Palette</h1>
        {saved && <span className="text-green-600 font-medium">Saved successfully!</span>}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(Object.entries(colorPalettes) as [PaletteKey, typeof colorPalettes[PaletteKey]][]).map(([key, palette]) => (
          <div
            key={key}
            onClick={() => setSelectedPalette(key)}
            className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
              selectedPalette === key ? 'border-[var(--primary)] shadow-lg scale-105' : 'border-transparent hover:border-gray-300'
            }`}
          >
            {/* Preview */}
            <div 
              className="p-4 h-40"
              style={{ backgroundColor: palette.background }}
            >
              <div 
                className="text-white px-3 py-1 text-xs rounded w-fit mb-2"
                style={{ backgroundColor: palette.primary }}
              >
                Header
              </div>
              <div 
                className="text-white px-3 py-1 text-xs rounded w-fit"
                style={{ backgroundColor: palette.accent }}
              >
                Button
              </div>
              <p className="text-xs mt-2" style={{ color: palette.text }}>Sample text</p>
            </div>
            
            {/* Info */}
            <div className="bg-white p-3">
              <p className="font-medium text-gray-800">{palette.name}</p>
              <div className="flex gap-1 mt-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: palette.primary }} title="Primary" />
                <div className="w-6 h-6 rounded" style={{ backgroundColor: palette.accent }} title="Accent" />
                <div className="w-6 h-6 rounded border" style={{ backgroundColor: palette.background }} title="Background" />
                <div className="w-6 h-6 rounded border" style={{ backgroundColor: palette.text }} title="Text" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Selected Palette</h2>
        {selectedPalette && (
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Primary</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: colorPalettes[selectedPalette as PaletteKey].primary }} />
                <span className="text-sm">{colorPalettes[selectedPalette as PaletteKey].primary}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Accent</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: colorPalettes[selectedPalette as PaletteKey].accent }} />
                <span className="text-sm">{colorPalettes[selectedPalette as PaletteKey].accent}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Background</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: colorPalettes[selectedPalette as PaletteKey].background }} />
                <span className="text-sm">{colorPalettes[selectedPalette as PaletteKey].background}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Text</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: colorPalettes[selectedPalette as PaletteKey].text }} />
                <span className="text-sm">{colorPalettes[selectedPalette as PaletteKey].text}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Secondary BG</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: colorPalettes[selectedPalette as PaletteKey].secondaryBg }} />
                <span className="text-sm">{colorPalettes[selectedPalette as PaletteKey].secondaryBg}</span>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--primary)] text-white px-6 py-2 rounded font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Palette'}
        </button>
      </div>
    </div>
  )
}
