import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePublicContent } from '@/lib/revalidatePublic'

export async function GET() {
  const content = await prisma.homeContent.findMany()
  return NextResponse.json(content)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const data = await request.json()
  const content = await prisma.homeContent.upsert({
    where: { key: data.key },
    update: { value: data.value },
    create: { key: data.key, value: data.value, description: data.description || null },
  })
  revalidatePublicContent()
  return NextResponse.json(content)
}
