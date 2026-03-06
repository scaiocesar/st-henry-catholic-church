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
  await prisma.galleryPhoto.delete({ where: { id: parseInt(id) } })
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
  const photo = await prisma.galleryPhoto.update({
    where: { id: parseInt(id) },
    data: {
      title: data.title || null,
      url: data.url,
      description: data.description || null,
      sortOrder: data.sortOrder,
    },
  })
  return NextResponse.json(photo)
}
