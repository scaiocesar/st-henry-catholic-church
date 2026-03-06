import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { signSession, getSession } from '@/lib/auth'

export async function POST(request: Request) {
  const data = await request.json()
  const { username, password } = data

  if (!username || !password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const admin = await prisma.adminUser.findFirst({ where: { username } })

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = signSession({ id: admin.id, username: admin.username })
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
  })

  return NextResponse.json({ success: true, username: admin.username })
}

export async function GET() {
  const session = await getSession()
  if (session) {
    return NextResponse.json({ authenticated: true })
  }
  return NextResponse.json({ authenticated: false })
}
