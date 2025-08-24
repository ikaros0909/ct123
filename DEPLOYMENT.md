# Samsung Analysis - Deployment Guide

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Environment Setup

1. Copy the environment variables template:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/samsung_db?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-secure-jwt-secret-key"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"

# Admin Password (optional, defaults to Admin@123!)
ADMIN_PASSWORD="YourSecureAdminPassword"
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Setup database and create admin account:
```bash
# Push database schema
npm run db:push

# Create admin account and seed data
npm run db:seed
```

## Admin Account

The seed script creates an admin account with the following credentials:

- **Email**: `admin@ct123.kr`
- **Password**: `Admin@123!` (or value from ADMIN_PASSWORD env variable)
- **Role**: ADMIN

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

## Database Setup Commands

```bash
# Push schema to database
npm run db:push

# Run migrations (production)
npx prisma migrate deploy

# Run seed (creates admin account)
npm run db:seed

# Complete setup (push + seed)
npm run db:setup
```

## Build and Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### PM2 Deployment (Production)
```bash
# Start with PM2
npm run pm2:start

# Start on port 80 (requires sudo)
sudo npm run pm2:start:80

# Other PM2 commands
npm run pm2:status  # Check status
npm run pm2:logs    # View logs
npm run pm2:restart # Restart app
npm run pm2:stop    # Stop app
```

## Seed Script Details

The seed script (`prisma/seed.ts`) performs the following:

1. **Creates Admin Account**:
   - Email: `admin@ct123.kr`
   - Password: From `ADMIN_PASSWORD` env or defaults to `Admin@123!`
   - Name: CT123 Admin
   - Role: ADMIN

2. **Creates Sample Companies** (optional):
   - 삼성전자 (Samsung Electronics)
   - LG에너지솔루션 (LG Energy Solution)
   - 현대자동차 (Hyundai Motor)

## Re-running Seed

The seed script is idempotent - it checks for existing data before creating:

```bash
# Run seed manually
npm run prisma:seed

# Or using db:seed
npm run db:seed
```

## Security Notes

1. **Change default admin password** immediately after deployment
2. **Generate secure JWT_SECRET** for production
3. **Keep OPENAI_API_KEY** secure and never commit to version control
4. **Use HTTPS** in production environment
5. **Set proper database credentials** with limited permissions

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
psql -U samsung_user -d samsung_db -h localhost -c "SELECT 1"
```

### Reset Admin Password
If you forget the admin password, you can reset it by:
1. Delete the admin user from database
2. Re-run the seed script with new ADMIN_PASSWORD env variable

### Clear All Data
```bash
# Dangerous: This will delete all data!
npx prisma db push --force-reset
npm run db:seed
```

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret key for JWT tokens |
| OPENAI_API_KEY | Yes | OpenAI API key for AI analysis |
| ADMIN_PASSWORD | No | Admin account password (default: Admin@123!) |
| NEXT_PUBLIC_API_URL | No | API URL for frontend (default: http://localhost:3000) |