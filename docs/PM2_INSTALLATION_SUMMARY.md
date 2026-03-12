# PM2 Installation Summary

**Date:** February 9, 2026  
**Status:** ✅ **COMPLETE AND RUNNING**

---

## What Was Installed

### 1. PM2 Process Manager
- **Version:** 6.0.14
- **Type:** Global installation
- **Purpose:** Monitor and manage the backend server process

```bash
npm install -g pm2
✅ Successfully installed: 133 packages
```

---

## What Was Created

### Configuration Files

| File | Purpose |
|------|---------|
| **ecosystem.config.js** | PM2 ecosystem configuration for managing the backend |
| **package.json** (updated) | Added 9 new npm scripts for PM2 management |

### Documentation Files

| File | Content |
|------|---------|
| **PM2_SETUP_GUIDE.md** | Comprehensive PM2 setup and usage guide |
| **PM2_QUICK_REFERENCE.md** | Quick command reference for common tasks |

### Log Directory

```
logs/
├── backend-out.log          # Standard output from backend
├── backend-error.log        # Error messages from backend
├── frontend-out-1.log       # Frontend output
└── frontend-error-1.log     # Frontend errors
```

---

## Ecosystem Configuration

### What's Being Monitored

**Application:** `swastiklab-backend`
- **Script:** `./backend/app.js`
- **Port:** 5000
- **Environment:** Development (can switch to production)
- **Mode:** Fork (single process)

### Key Features Enabled

✅ **Auto-Restart**
- Automatically restarts on crash
- Max 10 restart attempts
- Minimum 10 seconds uptime before counting as successful

✅ **File Watching (Hot-reload)**
- Watches: `backend/app.js`, `backend/routes/`, `backend/services/`, `backend/repositories/`, `backend/middleware/`
- Ignores: Database files, uploads, logs, node_modules, tests

✅ **Memory Management**
- Auto-restart if exceeds 500MB
- Prevents memory leaks from crashing service

✅ **Logging**
- Separate error and output logs
- Timestamp format: `YYYY-MM-DD HH:mm:ss Z`
- Location: `./logs/`

✅ **Monitoring**
- PMX integration for monitoring
- CPU and memory tracking
- Process uptime monitoring

---

## NPM Scripts Added

```json
{
  "pm2:start": "pm2 start ecosystem.config.js",
  "pm2:start:prod": "pm2 start ecosystem.config.js --env production",
  "pm2:stop": "pm2 stop all",
  "pm2:restart": "pm2 restart all",
  "pm2:reload": "pm2 reload all",
  "pm2:delete": "pm2 delete all",
  "pm2:logs": "pm2 logs",
  "pm2:status": "pm2 status",
  "pm2:monitor": "pm2 monitor",
  "pm2:save": "pm2 save",
  "pm2:startup": "pm2 startup",
  "pm2:unstartup": "pm2 unstartup"
}
```

### Quick Usage

```bash
npm run pm2:start          # Start monitoring
npm run pm2:logs           # View logs
npm run pm2:status         # Show status
npm run pm2:stop           # Stop process
npm run pm2:restart        # Restart process
npm run pm2:monitor        # Open dashboard
```

---

## Current Status

### Backend Process

✅ **RUNNING**

- **Process Name:** swastiklab-backend
- **Status:** Online
- **Memory:** ~30-77 MB
- **Port:** 5000
- **Database:** ✅ Initialized
- **Uptime:** Current session

### System

- **PM2 Version:** 6.0.14
- **Node.js:** v24.11.1
- **System:** Ubuntu 24.04.3 LTS (Dev Container)
- **Database:** SQLite (lab.db)

### Logs

✅ **Backend Output (last entry):**
```
2026-02-09 06:21:12 +00:00: 🚀 Server running on port 5000
✅ Database initialized successfully
```

---

## Quick Start Commands

### Start Monitoring Right Now

```bash
# Option 1 (Recommended)
npm run pm2:start

# Option 2
pm2 start ecosystem.config.js

# Option 3
cd backend && pm2 start app.js --name "swastiklab-backend"
```

### Check Status

```bash
npm run pm2:status
pm2 list
pm2 info swastiklab-backend
```

### View Live Logs

```bash
npm run pm2:logs
pm2 logs swastiklab-backend
tail -f logs/backend-out.log
```

### Restart if Needed

```bash
npm run pm2:restart
```

---

## Production Deployment

### Enable Auto-Startup on Server Boot

```bash
npm run pm2:startup
npm run pm2:save
```

This ensures PM2 processes restart automatically if the server reboots.

### Switch to Production Mode

```bash
npm run pm2:start:prod
```

Or:
```bash
NODE_ENV=production npm run pm2:start
```

---

## File Structure

```
/workspaces/swastiklab/
├── ecosystem.config.js              # 📋 PM2 config
├── package.json                     # 📦 Updated with PM2 scripts
├── PM2_SETUP_GUIDE.md              # 📖 Full guide
├── PM2_QUICK_REFERENCE.md          # 🚀 Quick commands
├── logs/
│   ├── backend-out.log             # 📝 Output logs
│   ├── backend-error.log           # ❌ Error logs
│   ├── frontend-out-1.log
│   └── frontend-error-1.log
├── backend/
│   ├── app.js                      # 🎯 Managed process
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   └── db/
└── ...
```

---

## Key Monitoring Metrics

Watch these in daily operations:

| Metric | Expected | Warning | Action |
|--------|----------|---------|--------|
| **Status** | Online | Errored/Stopped | Check logs: `npm run pm2:logs` |
| **Memory** | 30-100 MB | > 400 MB | Restart: `npm run pm2:restart` |
| **CPU** | 0-5% | > 50% | Check code for issues |
| **Restarts** | 0 | > 5 | Indicate crashes, check logs |
| **Uptime** | Continuous | < 1 hour | Process is crashing |

---

## Troubleshooting

### Backend won't start

```bash
# Check errors
npm run pm2:logs
tail -f logs/backend-error.log

# Test directly
cd backend && node app.js
```

### Port 5000 in use

```bash
lsof -i :5000
kill -9 <PID>
npm run pm2:restart
```

### High memory usage

```bash
# Check memory
pm2 monit

# Restart process
npm run pm2:restart
```

### Process keeps crashing

```bash
# View logs
pm2 logs swastiklab-backend

# Check for errors
tail -f logs/backend-error.log

# Test app
cd backend && node app.js
```

---

## What's Next?

1. ✅ **Monitor actively:** Run `npm run pm2:monitor` daily
2. ✅ **Review logs regularly:** Check for errors and warnings
3. ✅ **Set up alerts:** (Optional) Configure PM2 Plus for email alerts
4. ✅ **Enable auto-startup:** Run `npm run pm2:startup` for production
5. ✅ **Keep backups:** Save PM2 state with `npm run pm2:save`

---

## Configuration Details

See **PM2_SETUP_GUIDE.md** for:
- Detailed ecosystem configuration
- Advanced settings (cluster mode, etc.)
- Grace shutdown handling
- Production deployment
- Monitoring dashboard setup
- Troubleshooting guide

See **PM2_QUICK_REFERENCE.md** for:
- Command quick reference
- Common tasks
- Status icons explanation
- File locations

---

## Support Resources

- **PM2 Documentation:** https://pm2.io/docs
- **PM2 GitHub:** https://github.com/Unitech/pm2
- **Project Guide:** See PM2_SETUP_GUIDE.md

---

## Summary

✅ **PM2 Process Manager Successfully Installed & Configured**

The SwastitLab project backend is now under PM2 monitoring with:
- Auto-restart on crashes
- Hot-reload on code changes
- Memory overflow protection
- Comprehensive logging
- Easy command-line management
- Production-ready configuration

**Status:** Ready for Development & Production Use 🚀

---

**Installation Date:** February 9, 2026  
**PM2 Version:** 6.0.14  
**Backend Status:** ✅ ONLINE  
**Monitoring Status:** ✅ ACTIVE
