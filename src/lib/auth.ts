import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'fallback-change-in-production'

export function signSession(data: { id: number; username: string }): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function parseSession(token: string): { id: number; username: string } | null {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return null
    const payload = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
    const sigBuf = Buffer.from(sig, 'hex')
    const expectedBuf = Buffer.from(expectedSig, 'hex')
    if (sigBuf.length !== expectedBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ id: number; username: string } | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('admin_session')
  if (!cookie) return null
  return parseSession(cookie.value)
}

type AuthResult =
  | { session: { id: number; username: string }; response: null }
  | { session: null; response: NextResponse }

export async function requireAuth(): Promise<AuthResult> {
  const session = await getSession()
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.id } })
  if (!admin || admin.username !== session.username) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { session, response: null }
}
