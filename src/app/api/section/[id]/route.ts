import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import sanitizeHtml from 'sanitize-html'
import { revalidatePublicContent } from '@/lib/revalidatePublic'

const ALLOWED_HTML: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'img', 'br'],
  allowedAttributes: {
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'style'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAuth()
  if (response) return response

  const { id } = await params
  await prisma.section.delete({ where: { id: parseInt(id) } })
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
  const section = await prisma.section.update({
    where: { id: parseInt(id) },
    data: {
      title: data.title,
      content: sanitizeHtml(data.content ?? '', ALLOWED_HTML),
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  })
  revalidatePublicContent()
  return NextResponse.json(section)
}
