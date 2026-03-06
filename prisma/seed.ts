import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const rawPassword = process.env.ADMIN_PASSWORD
  if (!rawPassword) {
    throw new Error('ADMIN_PASSWORD env var must be set before running seed.')
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 12)

  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword },
    create: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@sthenry.org',
    },
  })

  const defaultLocations = ['St Henry', 'Santa Ana Mission']
  for (const [index, locationName] of defaultLocations.entries()) {
    const existing = await prisma.location.findFirst({ where: { name: locationName } })
    if (!existing) {
      await prisma.location.create({
        data: {
          name: locationName,
          sortOrder: index,
          isActive: true,
        },
      })
    }
  }

  const defaultSections = [
    { category: 'welcome', title: 'Welcome' },
    { category: 'history', title: 'History' },
    { category: 'about', title: 'About' },
    { category: 'sacraments', title: 'Sacraments' },
    { category: 'events', title: 'Events' },
    { category: 'ministries', title: 'Ministries' },
  ]
  for (const [index, section] of defaultSections.entries()) {
    await prisma.section.upsert({
      where: { category: section.category },
      update: {},
      create: {
        category: section.category,
        title: section.title,
        content: '<p>Update this section content from admin panel.</p>',
        sortOrder: index,
        isActive: true,
      },
    })
  }

  // Mass Schedules
  await prisma.massSchedule.createMany({
    data: [
      { day: 'Sunday', time: '8:30 am', language: 'English', massType: 'mass', sortOrder: 1 },
      { day: 'Sunday', time: '10:30 am', language: 'Spanish', massType: 'mass', sortOrder: 2 },
      { day: 'Monday', time: '9:00 am', language: 'English', massType: 'mass', sortOrder: 3 },
      { day: 'Wednesday', time: '9:00 am', language: 'English', massType: 'mass', sortOrder: 4 },
      { day: 'Thursday', time: '9:00 am', language: 'English', massType: 'mass', sortOrder: 5 },
      { day: 'Friday', time: '9:00 am', language: 'English', massType: 'mass', sortOrder: 6 },
      { day: 'Thursday', time: '9:30 am - 10:30 am', language: '', massType: 'adoration', sortOrder: 7 },
      { day: 'Saturday', time: '3:00 pm - 4:00 pm', language: '', massType: 'confession', sortOrder: 8 },
    ],
    skipDuplicates: true,
  })

  // Home Content
  await prisma.homeContent.createMany({
    data: [
      { key: 'parishName', value: 'St Henry Catholic Church' },
      { key: 'parishLogo', value: 'http://44.202.215.36/wp-content/uploads/2026/02/Asset-2@300x-8.png' },
      { key: 'heroTitle', value: 'Welcome to St Henry Catholic Church' },
      { key: 'heroSubtitle', value: 'Experience a vibrant community of faith where all are welcome. Join us for uplifting Mass services in both English and Spanish.' },
      { key: 'heroImage', value: 'http://44.202.215.36/wp-content/uploads/2026/02/image.jpg' },
      { key: 'welcomeTitle', value: 'Discover Our Vibrant Parish Community' },
      { key: 'welcomeText', value: 'St Henry Catholic Church serves as a beacon of faith and community in Brigham City, Utah. As a welcoming parish, we pride ourselves on creating an inclusive environment where individuals and families can come together in worship.' },
      { key: 'footerHours', value: 'Mon - Fri: 9 AM - 6 PM\nSat: 9 AM - 5 PM\nSun: 10 AM - 5 PM' },
      { key: 'footerLocation', value: '380 S 200 E\nBrigham City, UT 84302' },
      { key: 'footerContact', value: '(435) 723-2941\nSthenrys@comcast.net' },
    ],
    skipDuplicates: true,
  })

  // Social Links
  await prisma.socialLink.createMany({
    data: [
      { platform: 'Facebook', url: 'https://facebook.com', sortOrder: 1 },
      { platform: 'Instagram', url: 'https://instagram.com', sortOrder: 2 },
    ],
    skipDuplicates: true,
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
