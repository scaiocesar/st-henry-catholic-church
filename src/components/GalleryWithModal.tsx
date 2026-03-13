'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type GalleryPhotoItem = {
  id: number
  url: string
  title: string | null
  description: string | null
}

type GalleryWithModalProps = {
  photos: GalleryPhotoItem[]
  gridClassName?: string
  itemClassName?: string
  imageClassName?: string
  showOverlay?: boolean
}

export default function GalleryWithModal({
  photos,
  gridClassName = 'grid grid-cols-2 md:grid-cols-3 gap-4',
  itemClassName = 'relative overflow-hidden rounded-lg',
  imageClassName = 'w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110',
  showOverlay = false,
}: GalleryWithModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhotoItem | null>(null)

  useEffect(() => {
    if (!selectedPhoto) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedPhoto(null)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedPhoto])

  return (
    <>
      <div className={gridClassName}>
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className={`group ${itemClassName} text-left`}
            onClick={() => setSelectedPhoto(photo)}
            aria-label={`Open image: ${photo.title || 'Gallery photo'}`}
          >
            <Image
              src={photo.url}
              alt={photo.title || 'Gallery photo'}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className={imageClassName}
            />
            {showOverlay && (
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
            )}
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-[2px] p-4 md:p-8 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.title || 'Gallery image preview'}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-6xl max-h-[90vh] bg-black/30 rounded-lg overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-10 bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close image preview"
            >
              x
            </button>
            <div className="w-full h-[75vh] flex items-center justify-center bg-black">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.title || 'Gallery photo'}
                width={1600}
                height={1200}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {(selectedPhoto.title || selectedPhoto.description) && (
              <div className="bg-white px-4 py-3">
                {selectedPhoto.title && <h3 className="font-semibold text-[var(--secondary)]">{selectedPhoto.title}</h3>}
                {selectedPhoto.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedPhoto.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
