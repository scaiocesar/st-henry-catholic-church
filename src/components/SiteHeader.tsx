import Link from 'next/link'
import { getActiveSections, getHomeContentMap } from '@/lib/publicSite'

export default async function SiteHeader() {
  const [sections, homeContent] = await Promise.all([getActiveSections(), getHomeContentMap()])
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
          <Link href="/#gallery" className="text-[var(--secondary)] hover:text-[var(--primary)] font-medium">
            Gallery
          </Link>
          <Link href="/#contact" className="text-[var(--secondary)] hover:text-[var(--primary)] font-medium">
            Contact
          </Link>
        </nav>

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
              <Link href="/#gallery" className="px-3 py-2 rounded hover:bg-gray-100 text-[var(--secondary)]">
                Gallery
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
