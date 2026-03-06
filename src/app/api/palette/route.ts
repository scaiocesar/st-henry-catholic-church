import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { colorPalettes } from '@/lib/palettes'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: 'colorPalette' },
  })

  const paletteKey = setting?.value || 'default'
  const palette = colorPalettes[paletteKey as keyof typeof colorPalettes] || colorPalettes.default

  return NextResponse.json({ key: paletteKey, ...palette })
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const { paletteKey } = data

  if (!colorPalettes[paletteKey as keyof typeof colorPalettes]) {
    return NextResponse.json({ error: 'Invalid palette' }, { status: 400 })
  }

  const setting = await prisma.siteSettings.upsert({
    where: { key: 'colorPalette' },
    update: { value: paletteKey },
    create: { key: 'colorPalette', value: paletteKey },
  })

  return NextResponse.json(setting)
}
