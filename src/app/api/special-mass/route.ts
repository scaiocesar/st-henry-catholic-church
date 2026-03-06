import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const masses = await prisma.specialMass.findMany({
    where: { isActive: true },
    orderBy: { date: 'asc' },
  })
  return NextResponse.json(masses)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const mass = await prisma.specialMass.create({
    data: {
      title: data.title,
      description: data.description || null,
      date: new Date(data.date),
      time: data.time,
      location: data.location || null,
      isActive: true,
    },
  })
  return NextResponse.json(mass)
}
