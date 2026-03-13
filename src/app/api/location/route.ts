import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePublicContent } from '@/lib/revalidatePublic'

export async function GET() {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(locations)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const location = await prisma.location.create({
    data: {
      name: data.name,
      address: data.address || null,
      isActive: true,
      sortOrder: data.sortOrder || 0,
    },
  })
  revalidatePublicContent()
  return NextResponse.json(location)
}
