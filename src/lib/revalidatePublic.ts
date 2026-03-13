import { revalidatePath, revalidateTag } from 'next/cache'

const PUBLIC_TAGS = [
  'home-content',
  'seo',
  'sections',
  'social-links',
  'mass-schedules',
  'special-masses',
  'gallery-photos',
  'bulletins',
  'locations',
] as const

const PUBLIC_PATHS = ['/', '/gallery', '/bulletin', '/sitemap.xml'] as const

export function revalidatePublicContent() {
  PUBLIC_TAGS.forEach((tag) => revalidateTag(tag, 'max'))
  PUBLIC_PATHS.forEach((path) => revalidatePath(path))
  revalidatePath('/sections/[category]', 'page')
}
