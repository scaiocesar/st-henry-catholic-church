import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sthenryutah.org'

  const [sections, homeContent] = await Promise.all([
    prisma.section.findMany({
      where: { isActive: true },
      select: { category: true },
    }),
    prisma.homeContent.findMany(),
  ])

  const homeContentMap: Record<string, string> = {}
  homeContent.forEach((item) => {
    homeContentMap[item.key] = item.value
  })

  const url = homeContentMap.websiteUrl || baseUrl

  const staticPages = [
    {
      url,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${url}/#schedule`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${url}/#gallery`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${url}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  const sectionPages = sections.map((section) => ({
    url: `${url}/sections/${section.category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...sectionPages]
}
