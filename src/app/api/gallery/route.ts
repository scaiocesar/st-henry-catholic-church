import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const photos = await prisma.galleryPhoto.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(photos)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const photo = await prisma.galleryPhoto.create({
    data: {
      title: data.title || null,
      url: data.url,
      s3Key: data.s3Key || null,
      description: data.description || null,
      isActive: true,
      sortOrder: data.sortOrder || 0,
    },
  })
  return NextResponse.json(photo)
}
