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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  const { id } = await params
  const userId = parseInt(id, 10)
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const existing = await prisma.adminUser.findUnique({ where: { id: userId } })
  if (!existing) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  const data = await request.json()
  const username =
    typeof data.username === 'string' ? data.username.trim() : existing.username
  let email: string | null = existing.email
  if (data.email !== undefined) {
    if (data.email === null || data.email === '') {
      email = null
    } else if (typeof data.email === 'string') {
      email = data.email.trim() || null
    }
  }
  const password = typeof data.password === 'string' ? data.password : ''

  if (username.length < 2) {
    return NextResponse.json({ error: 'Username must be at least 2 characters.' }, { status: 400 })
  }

  if (password !== '' && password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  if (username !== existing.username) {
    const taken = await prisma.adminUser.findUnique({ where: { username } })
    if (taken) {
      return NextResponse.json({ error: 'This username is already taken.' }, { status: 409 })
    }
  }

  const updateData: {
    username: string
    email: string | null
    password?: string
  } = {
    username,
    email,
  }

  if (password !== '') {
    updateData.password = await bcrypt.hash(password, 12)
  }

  const user = await prisma.adminUser.update({
    where: { id: userId },
    data: updateData,
    select: selectPublic,
  })

  return NextResponse.json(user)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  const { id } = await params
  const userId = parseInt(id, 10)
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  if (userId === auth.session.id) {
    return NextResponse.json({ error: 'You cannot delete your own account while logged in.' }, { status: 400 })
  }

  const count = await prisma.adminUser.count()
  if (count <= 1) {
    return NextResponse.json({ error: 'Cannot delete the last administrator account.' }, { status: 400 })
  }

  const existing = await prisma.adminUser.findUnique({ where: { id: userId } })
  if (!existing) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  await prisma.adminUser.delete({ where: { id: userId } })
  return NextResponse.json({ success: true })
}
