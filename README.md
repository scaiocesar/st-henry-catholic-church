# St Henry Catholic Church - Next.js Website

Dynamic website with CMS for managing church content.

## Features

- **Dynamic Mass Schedule** - Manage regular and special mass times
- **Photo Gallery** - Upload and manage gallery photos
- **Social Media Links** - Manage social media connections
- **Lite CMS Admin Panel** - Easy content management at `/admin`

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Docker (optional, for local database)

## Quick Start

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session encryption
- `ADMIN_PASSWORD` - Password for admin panel access

### 3. Start Database

**Option A: Docker (Recommended for local development)**

```bash
docker-compose up -d
```

**Option B: External PostgreSQL**

Update `DATABASE_URL` in `.env` with your PostgreSQL connection string.

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with default data (optional)
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit:
- **Website:** http://localhost:3000
- **CMS Admin:** http://localhost:3000/admin

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `ADMIN_PASSWORD`
4. Deploy

For Vercel with PostgreSQL, use Vercel Postgres or a hosted PostgreSQL service like Supabase, Neon, or Railway.

## Project Structure

```
st-henry-next/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main website
│   │   ├── admin/            # CMS admin pages
│   │   └── api/              # API routes
│   └── lib/
│       └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
├── docker-compose.yml        # PostgreSQL database
├── .env                      # Environment variables
├── .env.example              # Example environment variables
└── package.json
```

## CMS Features

| Page | Function |
|------|----------|
| `/admin` | Dashboard overview |
| `/admin/schedule` | Manage regular mass times |
| `/admin/special` | Manage special masses/events |
| `/admin/gallery` | Manage photo gallery |
| `/admin/social` | Manage social media links |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** CSS Modules / Tailwind CSS
- **Deployment:** Vercel
