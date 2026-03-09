import { prisma } from '@/lib/prisma'

export type PublicSection = {
  id: number
  category: string
  title: string | null
  content: string
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

export async function getChurchJsonLd(): Promise<ChurchJsonLd> {
  const [homeContent, locations, massSchedules] = await Promise.all([
    getHomeContentMap(),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.massSchedule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { location: true },
    }),
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
