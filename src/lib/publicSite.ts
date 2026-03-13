import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export type PublicSection = {
  id: number
  category: string
  title: string | null
  content: string
  sortOrder: number
}

export type PublicSocialLink = {
  id: number
  platform: string
  url: string
  sortOrder: number
}

export type ChurchJsonLd = {
  name: string
  description: string
  url: string
  telephone?: string
  email?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  openingHours?: Array<{
    dayOfWeek: string[]
    opens: string
    closes: string
  }>
}

const getHomeContentMapCached = unstable_cache(
  async () => {
    const content = await prisma.homeContent.findMany()
    const map: Record<string, string> = {}
    content.forEach((item) => {
      map[item.key] = item.value
    })
    return map
  },
  ['public-home-content'],
  { revalidate: 300, tags: ['home-content', 'seo'] }
)

export async function getHomeContentMap() {
  return getHomeContentMapCached()
}

const getActiveSectionsCached = unstable_cache(
  async (): Promise<PublicSection[]> => {
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
  },
  ['public-active-sections'],
  { revalidate: 300, tags: ['sections'] }
)

export async function getActiveSections(): Promise<PublicSection[]> {
  return getActiveSectionsCached()
}

const getActiveSocialLinksCached = unstable_cache(
  async (): Promise<PublicSocialLink[]> => {
    return prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        platform: true,
        url: true,
        sortOrder: true,
      },
    })
  },
  ['public-active-social-links'],
  { revalidate: 300, tags: ['social-links'] }
)

export async function getActiveSocialLinks(): Promise<PublicSocialLink[]> {
  return getActiveSocialLinksCached()
}

export type PublicMassSchedule = Awaited<ReturnType<typeof getMassSchedules>>[number]

const getMassSchedulesCached = unstable_cache(
  async () => {
    return prisma.massSchedule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { location: true },
    })
  },
  ['public-mass-schedules'],
  { revalidate: 300, tags: ['mass-schedules', 'locations'] }
)

export async function getMassSchedules() {
  return getMassSchedulesCached()
}

const getSpecialMassesCached = unstable_cache(
  async () => {
    return prisma.specialMass.findMany({
      where: { isActive: true },
      orderBy: { date: 'asc' },
    })
  },
  ['public-special-masses'],
  { revalidate: 300, tags: ['special-masses'] }
)

export async function getSpecialMasses() {
  return getSpecialMassesCached()
}

export type PublicGalleryPhoto = Awaited<ReturnType<typeof getGalleryPhotos>>[number]

const getGalleryPhotosCached = unstable_cache(
  async () => {
    return prisma.galleryPhoto.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  },
  ['public-gallery-photos'],
  { revalidate: 300, tags: ['gallery-photos'] }
)

export async function getGalleryPhotos(limit?: number) {
  const photos = await getGalleryPhotosCached()
  if (typeof limit === 'number') {
    return photos.slice(0, limit)
  }
  return photos
}

const getEventsSectionCached = unstable_cache(
  async () => {
    return prisma.section.findFirst({
      where: { category: 'events', isActive: true },
      select: { title: true, content: true },
    })
  },
  ['public-events-section'],
  { revalidate: 300, tags: ['sections'] }
)

export async function getEventsSection() {
  return getEventsSectionCached()
}

const getBulletinsCached = unstable_cache(
  async () => {
    return prisma.bulletin.findMany({
      where: { isActive: true },
      orderBy: [{ isCurrent: 'desc' }, { publishDate: 'desc' }],
    })
  },
  ['public-bulletins'],
  { revalidate: 300, tags: ['bulletins'] }
)

export async function getBulletins() {
  return getBulletinsCached()
}

const getLocationsCached = unstable_cache(
  async () => {
    return prisma.location.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  },
  ['public-locations'],
  { revalidate: 300, tags: ['locations'] }
)

export async function getLocations() {
  return getLocationsCached()
}

export async function getHomeContentMapUncached() {
  const content = await prisma.homeContent.findMany()
  const map: Record<string, string> = {}
  content.forEach((item) => {
    map[item.key] = item.value
  })
  return map
}

export async function getChurchJsonLd(): Promise<ChurchJsonLd> {
  const [homeContent, locations, massSchedules] = await Promise.all([
    getHomeContentMap(),
    getLocations(),
    getMassSchedules(),
  ])

  const churchName = homeContent.parishName || homeContent.churchName || 'St. Henry Catholic Church'
  const churchDescription = homeContent.churchDescription || `Welcome to ${churchName} - A vibrant community of faith`
  const churchUrl = homeContent.websiteUrl || 'https://sthenryutah.org'
  const churchPhone = homeContent.phone || homeContent.parishPhone || undefined
  const churchEmail = homeContent.email || homeContent.parishEmail || undefined

  const mainLocation = locations[0]
  const address = mainLocation?.address ? {
    streetAddress: mainLocation.address,
    addressLocality: homeContent.city || 'Brigham City',
    addressRegion: homeContent.state || 'UT',
    postalCode: homeContent.zipCode || '84302',
    addressCountry: 'US',
  } : {
    addressLocality: homeContent.city || 'Brigham City',
    addressRegion: homeContent.state || 'UT',
    postalCode: homeContent.zipCode || '84302',
    addressCountry: 'US',
  }

  const openingHoursMap: Record<string, { opens: string; closes: string }> = {}
  massSchedules.forEach((schedule) => {
    const day = schedule.day.toLowerCase()
    if (!openingHoursMap[day] || schedule.time < openingHoursMap[day].opens) {
      openingHoursMap[day] = { opens: schedule.time, closes: getClosingTime(schedule.time) }
    }
  })

  const dayMap: Record<string, string> = {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
  }

  const openingHours = Object.entries(openingHoursMap).map(([day, hours]) => ({
    dayOfWeek: [dayMap[day] || day],
    opens: hours.opens,
    closes: hours.closes,
  }))

  return {
    name: churchName,
    description: churchDescription,
    url: churchUrl,
    telephone: churchPhone,
    email: churchEmail,
    address,
    openingHours: openingHours.length > 0 ? openingHours : undefined,
  }
}

function getClosingTime(massTime: string): string {
  const [hours, minutes] = massTime.split(':').map(Number)
  const closingHour = (hours + 1) % 24
  return `${closingHour.toString().padStart(2, '0')}:${minutes?.toString().padStart(2, '0') || '00'}`
}
