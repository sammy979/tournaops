# TournaOps

**The professional PUBG Mobile tournament management platform.**

Run your PUBG Mobile tournaments without spreadsheets.

- Production: https://www.tournaops.com
- Stack: Next.js 16, TypeScript, Prisma, PostgreSQL, Vercel

## Quick Start

1. Clone repo
2. Copy .env.example to .env.local and fill values
3. Run: npm install
4. Run: npx prisma generate
5. Run: npx prisma db push
6. Run: npm run dev

Opens at http://localhost:3001

## Key Environment Variables

- DATABASE_URL - PostgreSQL connection
- JWT_SECRET - 64-char random secret
- BLOB_READ_WRITE_TOKEN - Vercel Blob
- RESEND_API_KEY - Email (resend.com free)
- GROQ_API_KEY - AI features
- DODO_API_KEY - Payments
- TOURNAOPS_API_SECRET - Discord bot

## OBS Overlays

All auto-refresh every 5 seconds. Add as Browser Source 1920x1080 transparent:

- Standings: /overlay/[token]
- Match: /overlay/[token]/match
- Chicken Dinner: /overlay/[token]/chicken-dinner
- Final Results: /overlay/[token]/final-results
- Next Match: /overlay/[token]/next-match
- Top Fragger: /overlay/[token]/top-fragger

## Health Check

GET /api/health - returns database, email, AI, payments status

## Built with love in Nepal by @sammy979