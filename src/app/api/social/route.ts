import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePublicContent } from '@/lib/revalidatePublic'

export async function GET() {
  const links = await prisma.socialLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(links)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const link = await prisma.socialLink.create({
    data: {
      platform: data.platform,
      url: data.url,
      icon: data.icon || null,
      isActive: true,
      sortOrder: data.sortOrder || 0,
    },
  })
  revalidatePublicContent()
  return NextResponse.json(link)
}
