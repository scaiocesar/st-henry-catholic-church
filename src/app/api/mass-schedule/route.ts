import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePublicContent } from '@/lib/revalidatePublic'

export async function GET() {
  const schedules = await prisma.massSchedule.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { location: true },
  })
  return NextResponse.json(schedules)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const schedule = await prisma.massSchedule.create({
    data: {
      day: data.day,
      time: data.time,
      language: data.language || '',
      locationId: data.locationId || null,
      massType: data.massType || 'mass',
      isActive: true,
      sortOrder: data.sortOrder || 0,
    },
  })
  revalidatePublicContent()
  return NextResponse.json(schedule)
}
