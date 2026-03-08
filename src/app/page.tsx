import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

async function getMassSchedules() {
  try {
    return await prisma.massSchedule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { location: true },
    })
  } catch {
    return []
  }
}

async function getSpecialMasses() {
  try {
    return await prisma.specialMass.findMany({
      where: { isActive: true },
      orderBy: { date: 'asc' }
    })
  } catch {
    return []
  }
}

async function getGallery() {
  try {
    return await prisma.galleryPhoto.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 6
    })
  } catch {
    return []
  }
}

async function getSocialLinks() {
  try {
    return await prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })
  } catch {
    return []
  }
}

async function getHomeContent() {
  try {
    const content = await prisma.homeContent.findMany()
    const map: Record<string, string> = {}
    content.forEach((item) => {
      map[item.key] = item.value
    })
    return map
  } catch {
    return {}
  }
}

function SocialIcon({ platform }: { platform: string }) {
  const name = platform.toLowerCase()
  const iconClass = 'w-6 h-6'
  if (name.includes('facebook')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden="true">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.25.2 2.25.2v2.46H15.2c-1.25 0-1.64.78-1.64 1.58V12h2.79l-.45 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
      </svg>
    )
  }
  if (name.includes('instagram')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="7" r="1" fill="currentColor" />
      </svg>
    )
  }
  if (name.includes('youtube')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden="true">
        <path d="M21.58 7.2a2.99 2.99 0 0 0-2.1-2.12C17.64 4.6 12 4.6 12 4.6s-5.64 0-7.48.48A2.99 2.99 0 0 0 2.42 7.2C1.94 9.06 1.94 12 1.94 12s0 2.94.48 4.8a2.99 2.99 0 0 0 2.1 2.12c1.84.48 7.48.48 7.48.48s5.64 0 7.48-.48a2.99 2.99 0 0 0 2.1-2.12c.48-1.86.48-4.8.48-4.8s0-2.94-.48-4.8ZM10.2 15.04V8.96L15.4 12l-5.2 3.04Z" />
      </svg>
    )
  }
  return <span className="text-lg font-semibold leading-none">{platform.charAt(0).toUpperCase()}</span>
}

export default async function Home() {
  const massSchedules = await getMassSchedules()
  const specialMasses = await getSpecialMasses()
  const gallery = await getGallery()
  const socialLinks = await getSocialLinks()
  const homeContent = await getHomeContent()

  const scheduleByLocation = new Map<
    string,
    {
      name: string
      schedules: typeof massSchedules
      specials: typeof specialMasses
    }
  >()

  massSchedules.forEach((schedule) => {
    const locationName = schedule.location?.name || 'Unassigned location'
    const current = scheduleByLocation.get(locationName)
    if (current) {
      current.schedules.push(schedule)
      return
    }
    scheduleByLocation.set(locationName, {
      name: locationName,
      schedules: [schedule],
      specials: [],
    })
  })

  specialMasses.forEach((special) => {
    const locationName = special.location || 'Unassigned location'
    const current = scheduleByLocation.get(locationName)
    if (current) {
      current.specials.push(special)
      return
    }
    scheduleByLocation.set(locationName, {
      name: locationName,
      schedules: [],
      specials: [special],
    })
  })

  const locationCards = Array.from(scheduleByLocation.values())

  const defaultHeroTitle = 'Welcome to St Henry Catholic Church'
  const defaultHeroSubtitle = 'Experience a vibrant community of faith where all are welcome. Join us for uplifting Mass services in both English and Spanish.'
  const defaultHeroImage = 'http://44.202.215.36/wp-content/uploads/2026/02/image.jpg'
  const defaultWelcomeTitle = 'Discover Our Vibrant Parish Community'
  const defaultWelcomeText = 'St Henry Catholic Church serves as a beacon of faith and community in Brigham City, Utah. As a welcoming parish, we pride ourselves on creating an inclusive environment where individuals and families can come together in worship.'

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[500px] md:h-[600px] flex items-center justify-center pt-16 md:pt-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${homeContent.heroImage || defaultHeroImage})` }}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 text-center text-white px-4 sm:px-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 md:mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
            {homeContent.heroTitle || defaultHeroTitle}
          </h1>
          <p className="text-base md:text-xl max-w-2xl mx-auto mb-8">
            {homeContent.heroSubtitle || defaultHeroSubtitle}
          </p>
        </div>
      </section>

      {/* Welcome */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-5">
          <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-widest">Welcome</span>
          <h2 className="text-3xl md:text-4xl my-6 text-[var(--secondary)]" style={{ fontFamily: 'var(--font-heading)' }}>
            {homeContent.welcomeTitle || defaultWelcomeTitle}
          </h2>
          <p className="text-gray-600 mb-5 text-left">
            {homeContent.welcomeText || defaultWelcomeText}
          </p>
          <Link href="/sections/about" className="inline-block bg-[var(--secondary)] text-white px-8 py-4 font-semibold uppercase tracking-wider hover:bg-[#3d4145] transition">
            Learn More
          </Link>
        </div>
      </section>

      {/* Mass Schedule */}
      <section id="schedule" className="py-20 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-5">
          <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-widest">Mass Schedule</span>
          <h2 className="text-3xl md:text-4xl my-6 text-[var(--secondary)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Join Us for Worship
          </h2>

          {locationCards.length === 0 ? (
            <div className="mt-8 bg-white rounded-lg p-8 shadow text-gray-600">
              No schedules available yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              {locationCards.map((locationCard) => {
                const regularMasses = locationCard.schedules.filter((item) => item.massType === 'mass')
                const sundayMasses = regularMasses.filter((item) => item.day.toLowerCase().includes('sunday'))
                const dailyMasses = regularMasses.filter((item) => !item.day.toLowerCase().includes('sunday'))
                const adorationMasses = locationCard.schedules.filter((item) => item.massType === 'adoration')
                const confessionMasses = locationCard.schedules.filter((item) => item.massType === 'confession')

                return (
                  <div key={locationCard.name} className="bg-white p-8 rounded-lg shadow-lg text-left">
                    <h3 className="text-2xl text-[var(--primary)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                      {locationCard.name}
                    </h3>

                    {sundayMasses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-[var(--secondary)]">Sundays</h4>
                        {sundayMasses.map((mass) => (
                          <p key={mass.id} className="text-gray-600">
                            {mass.time} {mass.language ? `- ${mass.language}` : ''}
                          </p>
                        ))}
                      </div>
                    )}

                    {dailyMasses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-[var(--secondary)]">Daily Masses</h4>
                        {dailyMasses.map((mass) => (
                          <p key={mass.id} className="text-gray-600">
                            {mass.time} - {mass.day} {mass.language ? `(${mass.language})` : ''}
                          </p>
                        ))}
                      </div>
                    )}

                    {adorationMasses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-[var(--secondary)]">Adoration</h4>
                        {adorationMasses.map((mass) => (
                          <p key={mass.id} className="text-gray-600">
                            {mass.day} - {mass.time}
                          </p>
                        ))}
                      </div>
                    )}

                    {confessionMasses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-[var(--secondary)]">Confessions</h4>
                        {confessionMasses.map((mass) => (
                          <p key={mass.id} className="text-gray-600">
                            {mass.day} - {mass.time}
                          </p>
                        ))}
                      </div>
                    )}

                    {locationCard.specials.length > 0 && (
                      <div className="mt-8">
                        <h4 className="font-semibold text-[var(--primary)] mb-4 flex items-center gap-2">
                          Special Masses
                        </h4>
                        {locationCard.specials.map((mass) => (
                          <div key={mass.id} className="mb-3 p-4 rounded-lg bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border-l-4 border-[var(--primary)]">
                            <p className="font-semibold text-[var(--secondary)]">{mass.title}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(mass.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {mass.time}
                            </p>
                            {mass.description && (
                              <p className="text-sm text-gray-500 mt-2">{mass.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-20 bg-white text-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-5">
            <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-widest">Gallery</span>
            <h2 className="text-3xl md:text-4xl my-6 text-[var(--secondary)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Photo Gallery
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
              {gallery.map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg">
                  <img 
                    src={photo.url} 
                    alt={photo.title || 'Gallery photo'} 
                    className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact / CTA */}
      <section id="contact" className="py-20 bg-[var(--secondary)] text-center text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-5">
          <h2 className="text-3xl md:text-4xl mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
            Join Our Faith Community
          </h2>
          <p className="text-base md:text-xl mb-8 opacity-90">
            Become a part of our welcoming parish and explore how you can contribute to our shared mission of faith.
          </p>
          <a href="#contact" className="inline-block bg-[var(--primary)] text-white px-8 py-4 font-semibold uppercase tracking-wider hover:bg-[#5ab0d4] transition">
            Get Involved
          </a>
          
          {socialLinks.length > 0 && (
            <div className="mt-12 flex justify-center gap-6">
              {socialLinks.map((link) => (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[var(--primary)] text-2xl"
                  aria-label={link.platform}
                  title={link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
