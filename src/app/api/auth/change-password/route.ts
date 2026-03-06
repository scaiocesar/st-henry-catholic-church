import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  const { currentPassword, newPassword, confirmPassword } = await request.json()

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'All password fields are required.' }, { status: 400 })
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'New password confirmation does not match.' }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: auth.session.id },
  })

  if (!admin) {
    return NextResponse.json({ error: 'Invalid user.' }, { status: 401 })
  }

  const matchesCurrent = await bcrypt.compare(currentPassword, admin.password)
  if (!matchesCurrent) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 })
  }

  const samePassword = await bcrypt.compare(newPassword, admin.password)
  if (samePassword) {
    return NextResponse.json({ error: 'New password must be different from current password.' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { password: hashed },
  })

  return NextResponse.json({ success: true })
}
