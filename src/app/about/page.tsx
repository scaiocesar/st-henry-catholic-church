import { redirect } from 'next/navigation'
import { getActiveSections } from '@/lib/publicSite'

export default async function AboutPage() {
  const sections = await getActiveSections()
  const aboutSection = sections.find((section) => section.category === 'about')
  if (aboutSection) {
    redirect('/sections/about')
  }
  if (sections.length > 0) {
    redirect(`/sections/${sections[0].category}`)
  }
  redirect('/')
}
