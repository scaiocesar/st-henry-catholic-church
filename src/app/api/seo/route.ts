import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePublicContent } from '@/lib/revalidatePublic'

export async function GET() {
  const content = await prisma.homeContent.findMany()
  
  const seoMap: Record<string, string> = {}
  content.forEach((item) => {
    seoMap[item.key] = item.value
  })

  return NextResponse.json({
    keywords: seoMap.seoKeywords || '',
    ogImage: seoMap.seoOgImage || '/og-image.jpg',
    googleVerification: seoMap.seoGoogleVerification || '',
    twitterHandle: seoMap.seoTwitterHandle || '@sthenryutah',
  })
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const content = await prisma.homeContent.upsert({
    where: { key: data.key },
    update: { value: data.value },
    create: { key: data.key, value: data.value, description: data.description || null },
  })
  revalidatePublicContent()
  return NextResponse.json(content)
}
