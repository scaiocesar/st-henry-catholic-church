import Link from 'next/link'
import sanitizeHtml from 'sanitize-html'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import GalleryWithModal from '@/components/GalleryWithModal'
import {
  getEventsSection,
  getGalleryPhotos,
  getHomeContentMap,
  getMassSchedules,
  getSpecialMasses,
  getActiveSocialLinks,
} from '@/lib/publicSite'

const ALLOWED_HTML: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'img', 'br'],
  allowedAttributes: {
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'style'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
}

function SocialIcon({ platform }: { platform: string }) {
  const name = platform.toLowerCase()
  const iconClass = 'w-10 h-10'
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
  const [massSchedules, specialMasses, gallery, socialLinks, eventsSection, homeContent] = await Promise.all([
    getMassSchedules(),
    getSpecialMasses(),
    getGalleryPhotos(6),
    getActiveSocialLinks(),
    getEventsSection(),
    getHomeContentMap(),
  ])

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

  const defaultHeroTitle = 'St Henry Catholic Church - Mass Times, Schedule & Worship'
  const defaultHeroSubtitle = 'Join us for uplifting Catholic Mass services in English and Spanish. Find daily Mass times, Sunday Mass schedule, Confession, and Adoration at our welcoming parish community in Brigham City, Utah.'
  const defaultHeroImage = '/images/hero-default.jpg'
  const defaultWelcomeTitle = 'Discover Our Vibrant Parish Community'
  const defaultWelcomeText = 'St Henry Catholic Church serves as a beacon of faith and community in Brigham City, Utah. As a welcoming parish, we pride ourselves on creating an inclusive environment where individuals and families can come together in worship. Our church offers regular Mass times throughout the week, including daily Mass for those seeking spiritual nourishment on weekdays, and special Sunday Mass celebrations that bring our community together in praise. We provide Mass in both English and Spanish to serve our diverse congregation. In addition to our regular Mass schedule, we offer opportunities for Adoration of the Blessed Sacrament, where parishioners can spend quiet time in prayer before the Lord. Confession is available weekly, providing a sacred opportunity for reconciliation and spiritual healing. Whether you are a lifelong Catholic or exploring the faith for the first time, St Henry Catholic Church welcomes you to join us for Mass. Our parish community is dedicated to living out the teachings of Christ through liturgy, fellowship, and service to others. Come experience the warmth of our faith community and find a home at St Henry Catholic Church.'

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

      {/* Events */}
      {eventsSection && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-5">
            <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-widest">Events</span>
            <h2 className="text-3xl md:text-4xl my-6 text-[var(--secondary)]" style={{ fontFamily: 'var(--font-heading)' }}>
              {eventsSection.title || 'Events'}
            </h2>
            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(eventsSection.content, ALLOWED_HTML) }}
            />
          </div>
        </section>
      )}

      {/* Mass Schedule */}
      <section
        id="schedule"
        className="py-20 text-center bg-gradient-to-br from-[var(--secondary)]/10 via-[var(--primary)]/10 to-white"
      >
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
            
            <div className="mt-12">
              <GalleryWithModal
                photos={gallery}
                gridClassName="grid grid-cols-2 md:grid-cols-3 gap-4"
                itemClassName="relative aspect-square overflow-hidden rounded-lg"
                imageClassName="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
              />
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
          
          {socialLinks.length > 0 && (
            <div className="mt-10 flex justify-center gap-5 md:gap-6">
              {socialLinks.map((link) => (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full border-2 border-white/70 bg-white/10 text-white hover:text-[var(--secondary)] hover:bg-white transition-all shadow-lg shadow-black/25 flex items-center justify-center"
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
