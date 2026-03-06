import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import sanitizeHtml from 'sanitize-html'

const ALLOWED_HTML: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'img', 'br'],
  allowedAttributes: {
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'style'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
}

export async function GET() {
  const content = await prisma.aboutContent.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(content)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const content = await prisma.aboutContent.create({
    data: {
      section: data.section,
      title: data.title || null,
      content: sanitizeHtml(data.content ?? '', ALLOWED_HTML),
      isActive: true,
      sortOrder: data.sortOrder || 0,
    },
  })
  return NextResponse.json(content)
}
