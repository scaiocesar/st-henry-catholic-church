import { notFound } from 'next/navigation'
import sanitizeHtml from 'sanitize-html'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { getActiveSections } from '@/lib/publicSite'

const ALLOWED_HTML: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'img', 'br'],
  allowedAttributes: {
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'style'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
}

export default async function SectionPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const sections = await getActiveSections()
  const section = sections.find((item) => item.category === category)

  if (!section) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative h-[260px] md:h-[320px] flex items-center justify-center pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero-default.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 text-center text-white px-4 sm:px-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
            {section.title || section.category}
          </h1>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-5">
          <div
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content, ALLOWED_HTML) }}
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
