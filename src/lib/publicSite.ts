import { prisma } from '@/lib/prisma'

export type PublicSection = {
  id: number
  category: string
  title: string | null
  content: string
  sortOrder: number
}

export async function getHomeContentMap() {
  const content = await prisma.homeContent.findMany()
  const map: Record<string, string> = {}
  content.forEach((item) => {
    map[item.key] = item.value
  })
  return map
}

export async function getActiveSections(): Promise<PublicSection[]> {
  return prisma.section.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      category: true,
      title: true,
      content: true,
      sortOrder: true,
    },
  })
}
