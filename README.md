# Employee Salary Slip Automation

A full-stack Next.js application that automates the process of generating and emailing salary slip PDFs from CSV/Excel payroll data.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** Neon PostgreSQL + Prisma ORM
- **PDF Generation:** pdfkit
- **Email:** Nodemailer (Gmail SMTP)
- **File Parsing:** csv-parser, xlsx
- **File Archival:** Cloudinary
- **Styling:** Custom CSS Custom Properties (Dark Theme)

## Prerequisites
1. Node.js 18+
2. Neon Database ([neon.tech](https://neon.tech/))
3. Cloudinary Account
4. Gmail Account with App Passwords enabled

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Fill in `.env` with your API keys (see `.env.example`).
   ```bash
   cp .env.example .env
   ```

3. **Database Migration**
   Run Prisma migrations to create the tables in Neon.
   ```bash
   npx prisma db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## Deployment (Vercel)
This app is designed as a single Next.js unified deployment.
1. Push your code to GitHub.
2. Link the repository in Vercel.
3. Add all the environment variables from your `.env` to Vercel.
4. Set the build command to `npm run build && npx prisma generate` (if not detected automatically).
5. Deploy!
