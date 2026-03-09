import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const bulletins = await prisma.bulletin.findMany({
    where: { isActive: true },
    orderBy: [{ isCurrent: 'desc' }, { publishDate: 'desc' }],
  })
  return NextResponse.json(bulletins)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()

  if (data.isCurrent === true) {
    await prisma.bulletin.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    })
  }

  const bulletin = await prisma.bulletin.create({
    data: {
      title: data.title,
      url: data.url,
      s3Key: data.s3Key || null,
      description: data.description || null,
      isActive: true,
      isCurrent: data.isCurrent || false,
      publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
      sortOrder: data.sortOrder || 0,
    },
  })
  return NextResponse.json(bulletin)
}
