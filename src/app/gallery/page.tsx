import { prisma } from '@/lib/prisma'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

async function getGalleryPhotos() {
  try {
    return await prisma.galleryPhoto.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  } catch {
    return []
  }
}

export default async function GalleryPage() {
  const photos = await getGalleryPhotos()

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
            Photo Gallery
          </h1>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-5">
          {photos.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">No photos available at this time.</p>
              <p className="mt-2">Please check back later for updates from our parish community.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group overflow-hidden rounded-lg">
                  <img 
                    src={photo.url} 
                    alt={photo.title || 'Gallery photo'} 
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    {photo.title && (
                      <div className="p-4">
                        <h3 className="text-white font-semibold">{photo.title}</h3>
                        {photo.description && (
                          <p className="text-gray-200 text-sm mt-1">{photo.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
