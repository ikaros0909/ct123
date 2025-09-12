#!/usr/bin/env node

/**
 * Post-install script to ensure Prisma client is generated
 * This runs automatically after npm install
 */

const { execSync } = require('child_process');

console.log('🔧 Running post-install script...');

try {
  // Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully');
  
  // Optional: Run database migrations in production
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Running database migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Database migrations completed');
    } catch (migrateError) {
      console.warn('⚠️ Migration failed or no migrations to apply');
    }
  }
} catch (error) {
  console.error('❌ Post-install script failed:', error.message);
  process.exit(1);
}

console.log('✨ Post-install completed successfully');