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

export async function GET() {
  const auth = await requireAuth()
  if (auth.response) {
    const publicSections = await prisma.section.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(publicSections)
  }

  const adminSections = await prisma.section.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(adminSections)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const section = await prisma.section.upsert({
    where: { category: data.category },
    update: {
      title: data.title,
      content: sanitizeHtml(data.content ?? '', ALLOWED_HTML),
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder || 0,
    },
    create: {
      category: data.category,
      title: data.title || null,
      content: sanitizeHtml(data.content ?? '', ALLOWED_HTML),
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder || 0,
    },
  })
  revalidatePublicContent()
  return NextResponse.json(section)
}
