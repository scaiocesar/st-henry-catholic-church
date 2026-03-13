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
  await prisma.socialLink.delete({ where: { id: parseInt(id) } })
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
  const link = await prisma.socialLink.update({
    where: { id: parseInt(id) },
    data: {
      platform: data.platform,
      url: data.url,
      icon: data.icon || null,
      sortOrder: data.sortOrder,
    },
  })
  revalidatePublicContent()
  return NextResponse.json(link)
}
