'use client'

import { useEffect, useState } from 'react'
import { colorPalettes, PaletteKey } from '@/lib/palettes'

interface PaletteProviderProps {
  children: React.ReactNode
}

export default function PaletteProvider({ children }: PaletteProviderProps) {
  const [palette, setPalette] = useState<typeof colorPalettes['default']>(colorPalettes.default)

  useEffect(() => {
    fetchPalette()
  }, [])

  const fetchPalette = async () => {
    try {
      const res = await fetch('/api/palette')
      const data = await res.json()
      const paletteKey = data.key as PaletteKey
      if (colorPalettes[paletteKey]) {
        setPalette(colorPalettes[paletteKey])
      }
    } catch (error) {
      console.error('Failed to fetch palette:', error)
    }
  }

  useEffect(() => {
    // Apply CSS variables
    document.documentElement.style.setProperty('--primary', palette.primary)
    document.documentElement.style.setProperty('--accent', palette.accent)
    document.documentElement.style.setProperty('--secondary', palette.text)
    document.documentElement.style.setProperty('--light', palette.background)
    document.documentElement.style.setProperty('--dark', palette.text)
  }, [palette])

  return <>{children}</>
}
