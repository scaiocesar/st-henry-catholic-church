import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { revalidatePublicContent } from '@/lib/revalidatePublic'

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
  
  const photo = await prisma.galleryPhoto.findUnique({
    where: { id: parseInt(id) },
  })

  if (photo?.s3Key) {
    await deleteFromS3(photo.s3Key)
  }

  await prisma.galleryPhoto.delete({ where: { id: parseInt(id) } })
  revalidatePublicContent()
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
  
  const updateData: {
    title: string | null
    url: string
    description: string | null
    sortOrder: number
    s3Key?: string | null
  } = {
    title: data.title || null,
    url: data.url,
    description: data.description || null,
    sortOrder: data.sortOrder || 0,
  }

  if (data.s3Key !== undefined) {
    updateData.s3Key = data.s3Key
  }

  const photo = await prisma.galleryPhoto.update({
    where: { id: parseInt(id) },
    data: updateData,
  })
  revalidatePublicContent()
  return NextResponse.json(photo)
}
