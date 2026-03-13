import Link from 'next/link'
import { getActiveSections, getActiveSocialLinks, getHomeContentMap } from '@/lib/publicSite'

function SocialIcon({ platform }: { platform: string }) {
  const name = platform.toLowerCase()
  const iconClass = 'w-4 h-4'
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
  return <span className="text-xs font-semibold leading-none">{platform.charAt(0).toUpperCase()}</span>
}

export default async function SiteHeader() {
  const [sections, homeContent, socialLinks] = await Promise.all([
    getActiveSections(),
    getHomeContentMap(),
    getActiveSocialLinks(),
  ])
  const defaultParishName = 'St Henry Catholic Church'
  const parishName = homeContent.parishName || homeContent.churchName || defaultParishName
  const parishLogo = homeContent.parishLogo || homeContent.churchLogo || null

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 md:py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {parishLogo ? (
            <>
              <Link href="/">
                <img src={parishLogo} alt={parishName} className="h-10 md:h-14 w-auto object-contain" />
              </Link>
              <Link href="/" className="text-[var(--secondary)]">
                <span
                  className="text-base sm:text-xl md:text-2xl font-semibold text-[var(--secondary)] truncate hidden md:block"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {parishName}
                </span>
              </Link>
            </>
          ) : (
            <Link href="/" className="text-[var(--secondary)]">
              <span
                className="text-base sm:text-xl md:text-2xl font-semibold text-[var(--secondary)] truncate"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {parishName}
              </span>
            </Link>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-5 xl:gap-6">
          <nav className="hidden lg:flex gap-6 xl:gap-8">
            <Link href="/" className="text-[var(--secondary)] hover:text-[var(--primary)] font-medium">
              Home
            </Link>
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/sections/${section.category}`}
                className="text-[var(--secondary)] hover:text-[var(--primary)] font-medium"
              >
                {section.title || section.category}
              </Link>
            ))}
            <Link href="/#schedule" className="text-[var(--secondary)] hover:text-[var(--primary)] font-medium">
              Schedule
            </Link>
            <Link href="/gallery" className="text-[var(--secondary)] hover:text-[var(--primary)] font-medium">
              Gallery
            </Link>
            <Link href="/bulletin" className="text-[var(--secondary)] hover:text-[var(--primary)] font-medium">
              Bulletin
            </Link>
            <Link href="/#contact" className="text-[var(--secondary)] hover:text-[var(--primary)] font-medium">
              Contact
            </Link>
          </nav>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 pl-1 border-l border-gray-200">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[var(--secondary)] text-white flex items-center justify-center hover:bg-[var(--primary)] transition-colors"
                  aria-label={link.platform}
                  title={link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          )}
        </div>

        <details className="lg:hidden relative">
          <summary className="list-none cursor-pointer px-3 py-2 rounded border text-[var(--secondary)] text-sm font-medium">
            Menu
          </summary>
          <div className="absolute right-0 mt-2 w-72 max-h-[70vh] overflow-auto bg-white border rounded-lg shadow-lg p-3">
            <nav className="flex flex-col">
              <Link href="/" className="px-3 py-2 rounded hover:bg-gray-100 text-[var(--secondary)]">
                Home
              </Link>
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={`/sections/${section.category}`}
                  className="px-3 py-2 rounded hover:bg-gray-100 text-[var(--secondary)]"
                >
                  {section.title || section.category}
                </Link>
              ))}
              <Link href="/#schedule" className="px-3 py-2 rounded hover:bg-gray-100 text-[var(--secondary)]">
                Schedule
              </Link>
              <Link href="/gallery" className="px-3 py-2 rounded hover:bg-gray-100 text-[var(--secondary)]">
                Gallery
              </Link>
              <Link href="/bulletin" className="px-3 py-2 rounded hover:bg-gray-100 text-[var(--secondary)]">
                Bulletin
              </Link>
              <Link href="/#contact" className="px-3 py-2 rounded hover:bg-gray-100 text-[var(--secondary)]">
                Contact
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  )
}
