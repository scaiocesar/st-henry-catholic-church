import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${uniqueSuffix}.${ext}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)

  return NextResponse.json({ 
    url: `/uploads/${filename}`,
    filename 
  })
}
