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
- Supabase project (for storage and optional database)

### Supabase API Keys

To find your Supabase credentials:

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Go to **Project Settings** (gear icon) > **API**
4. Find the following values:
   - **Project URL** - This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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

### Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME&env=DATABASE_URL,SESSION_SECRET,ADMIN_PASSWORD,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envLink=https%3A%2F%2Fgithub.com%2FYOUR_GITHUB_USERNAME%2FYOUR_REPO_NAME%2Fblob%2Fmain%2F.env.example)

### Manual Deploy

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
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
