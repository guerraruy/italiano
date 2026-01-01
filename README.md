# Italiano - Italian Learning App

A modern web application for learning Italian, built with Next.js, Material-UI, and PostgreSQL.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Modern React component library
- **@emotion/styled** - CSS-in-JS styling solution
- **Prisma** - Type-safe ORM for database management
- **PostgreSQL** - Relational database

## Prerequisites

- Node.js 20.19+, 22.12+, or 24.0+ (or use Node.js 22.1+ with Prisma v6)
- PostgreSQL database
- npm, yarn, pnpm, or bun

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a `.env` file in the root directory with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Example:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/italiano?schema=public"
```

### 3. Run Database Migrations

Generate the Prisma client and create the database schema:

```bash
npx prisma generate
npx prisma db push
```

Or if you want to use migrations:

```bash
npx prisma migrate dev --name init
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
italiano/
├── app/                      # Next.js App Router
│   ├── ThemeRegistry.tsx     # MUI theme provider
│   ├── theme.ts              # MUI theme configuration
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── lib/
│   └── prisma.ts             # Prisma client instance
├── prisma/
│   └── schema.prisma         # Database schema
└── package.json
```

## Database Schema

The application includes the following models:

- **User** - User authentication and profile
- **Lesson** - Italian learning lessons
- **Vocabulary** - Italian words and translations
- **UserLesson** - Track user progress

## Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create/update database schema
npx prisma db push

# Create a new migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (database GUI)
npx prisma studio

# View database schema
npx prisma db pull
```

## Styling

This project uses Material-UI with @emotion for styling. You can create styled components like this:

```tsx
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
}));
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

