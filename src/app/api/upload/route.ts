import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.S3_URL,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
})

const BUCKET_NAME = process.env.S3_BUCKET || 'uploads'

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

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  )

const projectRef = process.env.S3_PROJECT_REF || process.env.S3_URL?.split('.')[0]?.replace('https://', '') || ''
  const url = `https://${projectRef}.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${filename}`

  return NextResponse.json({ 
    url,
    filename 
  })
}
