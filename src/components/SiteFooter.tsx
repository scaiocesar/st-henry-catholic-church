import { getHomeContentMap } from '@/lib/publicSite'

function renderLines(text: string) {
  const lines = text.split('\n')
  return lines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ))
}

export default async function SiteFooter() {
  const homeContent = await getHomeContentMap()
  const footerHours = homeContent.footerHours || 'Mon - Fri: 9 AM - 6 PM\nSat: 9 AM - 5 PM\nSun: 10 AM - 5 PM'
  const footerLocation = homeContent.footerLocation || '380 S 200 E\nBrigham City, UT 84302'
  const footerContact = homeContent.footerContact || '(435) 723-2941\nSthenrys@comcast.net'
  const parishName = homeContent.parishName || homeContent.churchName || 'St Henry Catholic Church'

  return (
    <footer className="bg-[var(--dark)] text-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="text-center sm:text-left">
          <h4 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Hours
          </h4>
          <p className="text-gray-400">{renderLines(footerHours)}</p>
        </div>
        <div className="text-center sm:text-left">
          <h4 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Location
          </h4>
          <p className="text-gray-400">{renderLines(footerLocation)}</p>
        </div>
        <div className="text-center sm:text-left">
          <h4 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Contact
          </h4>
          <p className="text-gray-400">{renderLines(footerContact)}</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-5 mt-10 md:mt-12 pt-6 md:pt-8 border-t border-gray-800 text-center text-gray-500 text-sm md:text-base">
        <p>&copy; {new Date().getFullYear()} | {parishName}</p>
      </div>
    </footer>
  )
}
