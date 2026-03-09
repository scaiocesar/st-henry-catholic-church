import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

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

async function deleteFromS3(key: string) {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    )
  } catch (error) {
    console.error('Error deleting file from S3:', error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAuth()
  if (response) return response

  const { id } = await params
  
  const bulletin = await prisma.bulletin.findUnique({
    where: { id: parseInt(id) },
  })

  if (bulletin?.s3Key) {
    await deleteFromS3(bulletin.s3Key)
  }

  await prisma.bulletin.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAuth()
  if (response) return response

  const { id } = await params
  const data = await request.json()

  if (data.isCurrent === true) {
    await prisma.bulletin.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    })
  }

  const bulletin = await prisma.bulletin.update({
    where: { id: parseInt(id) },
    data: {
      title: data.title,
      description: data.description || null,
      isActive: data.isActive,
      isCurrent: data.isCurrent || false,
      sortOrder: data.sortOrder || 0,
    },
  })
  return NextResponse.json(bulletin)
}
