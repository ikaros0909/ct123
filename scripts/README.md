# Scripts Directory

This directory contains various scripts and utilities for the CT123 application.

## Directory Structure

### `/setup`
Contains setup and initialization scripts:
- `setup-*.bat` - Various setup scripts for different components
- `fix-*.bat` - Fix and configuration scripts

### `/database`
Database-related scripts and SQL files:
- `*-db*.bat` - Database management scripts
- `postgresql-*.bat` - PostgreSQL specific scripts
- `*.sql` - SQL scripts for database setup and maintenance

### `/test`
Test scripts and utilities:
- `test-*.bat` - Test scripts
- `check-*.js` - Validation scripts
- `find-*.js` - Search/debug utilities
- `diagnose.bat` - System diagnosis script

### `/pm2`
PM2 process manager configuration:
- `ecosystem.config.js` - PM2 configuration
- `pm2-*.sh` - PM2 management scripts

### `/utils`
Utility scripts:
- `extract-section.ps1` - PowerShell utility scripts

## Usage

Most scripts can be run from the project root directory using:
```bash
# Windows
scripts\setup\setup-all.bat

# Unix/Linux
./scripts/pm2/pm2-start.sh
```

## Important Scripts

- **Start/Stop**: Use `start.bat`/`stop.bat` (Windows) or `start.sh`/`stop.sh` (Unix) in the root directory
- **Run**: `run.bat` - Main execution script (kept in root for convenience)