# PM2 Process Manager Setup Guide

## Overview

PM2 v6.0.14 has been installed and configured to monitor and manage the SwastitLab project backend server. This guide covers setup, usage, and monitoring.

---

## Installation

✅ **PM2 is already installed globally:**
```bash
npm install -g pm2          # Already installed
pm2 --version              # 6.0.14
```

---

## Project Configuration

### Ecosystem Configuration File

📄 **File:** `ecosystem.config.js`

The project uses PM2's ecosystem config to manage the backend process:

```javascript
{
  name: 'swastiklab-backend',
  script: './backend/app.js',
  instances: 1,
  exec_mode: 'fork',
  env: {
    NODE_ENV: 'development',
    PORT: 5000,
    DB_PATH: './backend/db/lab.db'
  },
  watch: ['backend/app.js', 'backend/routes/', 'backend/services/', 'backend/repositories/', 'backend/middleware/'],
  ignore_watch: ['backend/uploads/', 'backend/logs/', 'backend/db/', 'backend/tests/', 'node_modules/', '.git/', 'logs/'],
  max_memory_restart: '500M',
  max_restarts: 10,
  min_uptime: '10s',
  error_file: './logs/backend-error.log',
  out_file: './logs/backend-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
}
```

### Key Features

- ✅ **Auto-restart:** Automatically restarts on crash
- ✅ **File watching:** Auto-reloads on source code changes
- ✅ **Memory management:** Restarts if memory exceeds 500MB
- ✅ **Logging:** Separate error and output logs
- ✅ **Database protection:** Ignores DB file changes to prevent false restarts

---

## NPM Scripts

Added convenient npm commands for PM2 management:

```bash
# Start the project with PM2
npm run pm2:start

# Start in production mode
npm run pm2:start:prod

# Stop all processes
npm run pm2:stop

# Restart all processes
npm run pm2:restart

# Reload all processes (graceful restart)
npm run pm2:reload

# Delete all processes from PM2
npm run pm2:delete

# View logs
npm run pm2:logs

# Show process status
npm run pm2:status

# Monitor dashboard
npm run pm2:monitor

# Save process state
npm run pm2:save

# Enable auto-startup on system reboot
npm run pm2:startup

# Disable auto-startup
npm run pm2:unstartup
```

---

## Quick Start

### Start Monitoring

```bash
# Option 1: Using npm
npm run pm2:start

# Option 2: Using pm2 directly
pm2 start ecosystem.config.js

# Option 3: Just the backend
cd backend && pm2 start app.js --name "swastiklab-backend"
```

### View Status

```bash
pm2 status
pm2 list
pm2 info swastiklab-backend
```

### View Logs

```bash
# All processes
npm run pm2:logs
pm2 logs

# Specific process
pm2 logs swastiklab-backend

# Specific file
tail -f logs/backend-out.log
tail -f logs/backend-error.log
```

### Stop/Restart

```bash
# Stop
npm run pm2:stop
pm2 stop swastiklab-backend

# Restart
npm run pm2:restart
pm2 restart swastiklab-backend

# Reload (graceful - finishes existing requests)
npm run pm2:reload
pm2 reload swastiklab-backend
```

---

## Production Deployment

### Enable Auto-Startup on Server Reboot

```bash
npm run pm2:startup

# Or manually:
pm2 startup
pm2 save
```

This ensures PM2 processes restart automatically if the system reboots.

### Production Environment Variables

Set up production environment in ecosystem.config.js:

```bash
npm run pm2:start:prod
```

Or with environment variable:
```bash
NODE_ENV=production pm2 start ecosystem.config.js
```

---

## Monitoring & Health Checks

### Real-time Dashboard

```bash
npm run pm2:monitor
pm2 monitor
```

This opens PM2's web-based monitoring dashboard.

### Process Health

Monitor key metrics:
- **CPU Usage:** Should be low when idle
- **Memory:** Restarts if exceeds 500MB threshold
- **Restart Count:** Indicates crashes/issues
- **Status:** Should show "online"
- **Uptime:** Shows how long process has been running

### Auto-Restart Behavior

- ✅ Automatically restarts on crash
- ✅ Waits 10 seconds for recovery (min_uptime)
- ✅ Max 10 restart attempts
- ✅ Recovers from port conflicts

---

## File Watching & Auto-Reload

The backend watches these directories for changes:
- `backend/app.js` - Main entry point
- `backend/routes/` - API routes
- `backend/services/` - Business logic
- `backend/repositories/` - Data access
- `backend/middleware/` - Express middleware

**Ignores** (won't trigger restart even if modified):
- `backend/db/` - Database files (prevents restart loops)
- `backend/uploads/` - User uploads
- `backend/logs/` - Log files
- `backend/tests/` - Test files
- `node_modules/` - Dependencies
- `.git/` - Repository files
- `logs/` - PM2 logs

---

## Logging

### Log Files Location

```
logs/
├── backend-out.log          # Standard output
└── backend-error.log        # Error output
```

### Log Format

```
[YYYY-MM-DD HH:mm:ss +00:00] [MESSAGE]
```

Example:
```
2026-02-09 06:21:12 +00:00: ✅ Database initialized successfully
2026-02-09 06:21:12 +00:00: 🚀 Server running on port 5000
```

### View Logs

```bash
# Real-time logs
pm2 logs

# Last 50 lines
pm2 logs --lines 50

# Specific process
pm2 logs swastiklab-backend

# From file
tail -f logs/backend-out.log
tail -f logs/backend-error.log
```

---

## Troubleshooting

### Process Won't Start

1. **Check error logs:**
   ```bash
   pm2 logs swastiklab-backend
   tail -f logs/backend-error.log
   ```

2. **Verify port is available:**
   ```bash
   lsof -i :5000
   netstat -tlnp | grep 5000
   ```

3. **Test app directly:**
   ```bash
   cd backend && node app.js
   ```

### Process Keeps Restarting

1. **Check for errors:**
   ```bash
   pm2 logs swastiklab-backend
   ```

2. **Increase min_uptime or max_restarts** in ecosystem.config.js

3. **Check memory usage:**
   ```bash
   pm2 monit
   ```

### High Memory Usage

- Set lower `max_memory_restart` threshold
- Check for memory leaks in code
- Monitor with `pm2 monit`

### Can't Connect to Port 5000

```bash
# Check if PM2 process is running
pm2 status

# Check if backend is listening
netstat -tlnp | grep 5000

# Check firewall
sudo ufw status
```

---

## Advanced Configuration

### Cluster Mode (Multiple Instances)

For high-traffic production, cluster mode distributes load:

```javascript
{
  name: 'swastiklab-backend',
  instances: 4,          // 4 instances = "max" for CPU cores
  exec_mode: 'cluster',  // Changed from 'fork'
  // ... rest of config
}
```

```bash
pm2 start ecosystem.config.js
pm2 reload swastiklab-backend    # Reload without downtime
```

### Node Args

For debugging or performance tuning:

```javascript
{
  name: 'swastiklab-backend',
  script: './backend/app.js',
  node_args: '--max-old-space-size=2048',  // Increase heap size
  // ...
}
```

### Graceful Shutdown

```javascript
{
  name: 'swastiklab-backend',
  kill_timeout: 5000,        // Wait 5s before force kill
  listen_timeout: 3000,      // Wait 3s for ready signal
  // ...
}
```

---

## Common Commands Reference

| Command | Function |
|---------|----------|
| `pm2 start ecosystem.config.js` | Start all apps |
| `pm2 stop all` | Stop all apps |
| `pm2 restart all` | Restart all apps |
| `pm2 reload all` | Graceful reload all |
| `pm2 delete all` | Remove all apps |
| `pm2 status` | Show status table |
| `pm2 logs` | Show live logs |
| `pm2 monit` | CPU/Memory monitor |
| `pm2 info swastiklab-backend` | Detailed process info |
| `npm run pm2:startup` | Enable auto-startup |
| `pm2 save` | Save session |
| `pm2 resurrect` | Restore saved session |

---

## Monitoring Checklist

✅ **Setup Complete:**
- [x] PM2 installed globally (v6.0.14)
- [x] Ecosystem config created
- [x] NPM scripts added
- [x] Log directory created
- [x] Backend successfully running

**Status:** Backend is currently **ONLINE** and **MONITORING**

- Process: `swastiklab-backend`
- Port: 5000
- Memory: < 500MB
- CPU: < 5% (idle)
- Database: ✅ Initialized
- Watch mode: ✅ Enabled
- Auto-restart: ✅ Enabled

---

## Next Steps

1. ✅ **Monitor processes:** `npm run pm2:monitor`
2. **View logs daily:** `npm run pm2:logs`
3. **Set up alerts** (optional) for high memory/CPU
4. **Enable auto-startup** for production: `npm run pm2:startup`
5. **Save state periodically:** `npm run pm2:save`

---

## Resources

- **PM2 Documentation:** https://pm2.io/docs
- **PM2 GitHub:** https://github.com/Unitech/pm2
- **PM2 Docs - Cluster:** https://pm2.io/docs/usage/cluster-mode/
- **PM2 Docs - Monitoring:** https://pm2.io/docs/usage/monitoring/

---

**Last Updated:** February 9, 2026  
**PM2 Version:** 6.0.14  
**Status:** ✅ Production Ready
