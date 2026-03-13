import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePublicContent } from '@/lib/revalidatePublic'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAuth()
  if (response) return response

  const { id } = await params
  await prisma.specialMass.delete({ where: { id: parseInt(id) } })
  revalidatePublicContent()
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
  const mass = await prisma.specialMass.update({
    where: { id: parseInt(id) },
    data: {
      title: data.title,
      description: data.description || null,
      date: new Date(data.date),
      time: data.time,
      location: data.location || null,
    },
  })
  revalidatePublicContent()
  return NextResponse.json(mass)
}
