import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const selectPublic = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
} as const

export async function GET() {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  const users = await prisma.adminUser.findMany({
    orderBy: { id: 'asc' },
    select: selectPublic,
  })

  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  const data = await request.json()
  const username = typeof data.username === 'string' ? data.username.trim() : ''
  const password = typeof data.password === 'string' ? data.password : ''
  const email =
    typeof data.email === 'string' && data.email.trim() !== '' ? data.email.trim() : null

  if (username.length < 2) {
    return NextResponse.json({ error: 'Username must be at least 2 characters.' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const existing = await prisma.adminUser.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: 'This username is already taken.' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.adminUser.create({
    data: {
      username,
      password: hashedPassword,
      email,
    },
    select: selectPublic,
  })

  return NextResponse.json(user)
}
