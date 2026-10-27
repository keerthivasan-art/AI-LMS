# AI-LMS (Intelligent Learning Management System)

An AI-powered SaaS Learning Management System built for teachers and students. Provides smart digital classrooms, 24/7 AI tutoring, automated quiz and assignment evaluation, progress tracking, and competitive coding events.

---

## 🚀 Phase 1 Status: COMPLETED

All Phase 1 architecture and foundation requirements have been fully implemented and verified.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
- **Backend Framework**: Spring Boot
- **Backend Language**: Java
- **Theme System**: [next-themes](https://github.com/pacocoursey/next-themes) (Light / Dark / System)
- **Toast Provider**: [Sonner](https://sonner.emilkowal.ski/)
- **Authentication**: [Clerk](https://clerk.com/) (Middleware, Auth Abstraction, Sign-in & Sign-up)
- **Database & ORM**: PostgreSQL & [Prisma Client](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/)

---

## 📁 Project Structure

```text
learn-ai/
├── prisma/
│   └── schema.prisma              # Database schema (User model & Role enum)
├── public/                        # Static assets & SVG icons
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx # Clerk Sign-In route
│   │   │   └── sign-up/[[...sign-up]]/page.tsx # Clerk Sign-Up route
│   │   ├── globals.css            # Tailwind v4 theme variables
│   │   ├── layout.tsx             # Root layout with AppProviders wrapper
│   │   ├── loading.tsx            # Global skeleton loading state
│   │   ├── error.tsx              # Error boundary component
│   │   ├── not-found.tsx          # 404 page
│   │   └── page.tsx               # SaaS Landing Page
│   ├── components/
│   │   ├── providers/             # AppProviders, ThemeProvider
│   │   ├── shared/                # ThemeToggle
│   │   └── ui/                    # shadcn UI components
│   ├── lib/
│   │   ├── auth.ts                # Server-side auth helpers
│   │   ├── db.ts                  # Prisma Client singleton
│   │   ├── env.ts                 # Type-safe Zod environment validation
│   │   └── utils.ts               # Classname utility (cn)
│   ├── middleware.ts              # Clerk authentication middleware
│   └── types/                     # Shared TypeScript interfaces
├── .env.example                   # Environment variable template
├── components.json                # shadcn/ui configuration
└── package.json                   # Project dependencies & scripts
```

---

## ⚙️ Local Setup & Environment Configuration

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database instance

### 2. Environment Variables
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your actual environment variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenAI API Key (Future Phases)
OPENAI_API_KEY="sk-..."
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Prisma Setup
Generate the Prisma client:

```bash
npx prisma generate
```

Push database schema to PostgreSQL (if database is connected):

```bash
npx prisma db push
```

---

## 💻 Development Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start development server at `http://localhost:3000` |
| `npm run build` | Build production bundle |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint check |
| `npx tsc --noEmit` | Run TypeScript typecheck |

---

## 📋 Implementation Status Matrix

| Module / Requirement | Status | Details |
| :--- | :--- | :--- |
| **Next.js App Router** | ✅ IMPLEMENTED | Version 16.3.5 with App Router structure |
| **TypeScript Foundation** | ✅ IMPLEMENTED | Strict type checking enabled |
| **Tailwind CSS v4** | ✅ IMPLEMENTED | Configured with CSS variable design system |
| **shadcn/ui Components** | ✅ IMPLEMENTED | Button, Card, Input, Label, Badge, Dialog, DropdownMenu, Avatar, Tooltip, Sheet, Skeleton, Separator |
| **Light/Dark Theme System** | ✅ IMPLEMENTED | `next-themes` with theme toggle component |
| **Toast System** | ✅ IMPLEMENTED | Sonner provider mounted |
| **Tooltip Architecture** | ✅ IMPLEMENTED | Radix tooltips supported |
| **Clerk Auth Foundation** | ✅ IMPLEMENTED | Middleware & `/sign-in` / `/sign-up` routes with graceful development fallback |
| **Auth Abstraction** | ✅ IMPLEMENTED | `src/lib/auth.ts` server helpers (`getCurrentUser`, `requireUser`, `getAppUser`, `requireRole`) |
| **Prisma Configuration** | ✅ IMPLEMENTED | PostgreSQL schema with `User` model and `TEACHER` / `STUDENT` role enum |
| **Prisma Client Singleton** | ✅ IMPLEMENTED | `src/lib/db.ts` with global hot-reload protection |
| **Environment Validation** | ✅ IMPLEMENTED | `src/lib/env.ts` with Zod schema separation (Public vs Server) |
| **SaaS Landing Page** | ✅ IMPLEMENTED | Hero, Capabilities, How it Works, Roles, AI Tutor visual preview, Footer |
| **Loading State** | ✅ IMPLEMENTED | `src/app/loading.tsx` skeleton layout |
| **Error Boundary** | ✅ IMPLEMENTED | `src/app/error.tsx` user-friendly error handler |
| **Classroom / Course Backend** | ✅ IMPLEMENTED | Class creation, unique join codes, and student enrollment |
| **Assignments & Submissions** | ✅ IMPLEMENTED | Creation, student submissions, teacher grading & feedback |
| **Quiz Management & AI Generator** | ✅ IMPLEMENTED | Manual creation & AI generation (.docx / text paste), review editor, grading |
| **AI Tutor (Socratic Mode)** | ✅ IMPLEMENTED | Streaming chat session, persistent conversation history |
| **Hackathons & Coding Contests** | ✅ IMPLEMENTED | Event discovery, registration deadline tracking, catalog |
| **In-App Notifications** | ✅ IMPLEMENTED | Real-time event notifications for assignments, quizzes, feedback |
| **Profile & Analytics** | ✅ IMPLEMENTED | Account metadata, role badges, learning metrics |

---

## 🛡️ Git Hygiene
The `.gitignore` file enforces that secrets (`.env*`) and build outputs (`.next`, `node_modules`) remain excluded from version control.
