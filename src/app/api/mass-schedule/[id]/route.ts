import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAuth()
  if (response) return response

  const { id } = await params
  await prisma.massSchedule.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAuth()
  if (response) return response

  const { id } = await params
  const data = await request.json()
  const schedule = await prisma.massSchedule.update({
    where: { id: parseInt(id) },
    data: {
      day: data.day,
      time: data.time,
      language: data.language,
      locationId: data.locationId || null,
      massType: data.massType || 'mass',
      sortOrder: data.sortOrder,
    },
  })
  return NextResponse.json(schedule)
}
