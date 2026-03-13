import { MetadataRoute } from 'next'
import { getActiveSections, getHomeContentMap } from '@/lib/publicSite'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sthenryutah.org'

  const [sections, homeContentMap] = await Promise.all([getActiveSections(), getHomeContentMap()])

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
