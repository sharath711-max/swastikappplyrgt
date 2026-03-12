# PM2 Quick Commands Reference

## Start/Stop/Restart

```bash
# Start project (uses ecosystem.config.js)
npm run pm2:start                # Development mode
npm run pm2:start:prod           # Production mode

# Stop all processes
npm run pm2:stop

# Restart all processes
npm run pm2:restart

# Reload all processes (graceful, no downtime)
npm run pm2:reload

# Delete all processes
npm run pm2:delete
```

## View Status & Logs

```bash
# Show process status table
npm run pm2:status
pm2 list                         # Alternative

# Show detailed info about a process
pm2 info swastiklab-backend

# View live logs
npm run pm2:logs
pm2 logs swastiklab-backend      # Specific process
tail -f logs/backend-out.log     # From file directly

# Monitor CPU/Memory (interactive)
pm2 monit
```

## Production Setup

```bash
# Enable auto-startup on system reboot
npm run pm2:startup

# Save current PM2 session
npm run pm2:save

# Restore saved session
pm2 resurrect

# Disable auto-startup
npm run pm2:unstartup
```

## Debugging

```bash
# Show errors
pm2 logs swastiklab-backend
tail -f logs/backend-error.log

# Check if port is in use
lsof -i :5000

# Force restart (kills and starts fresh)
pm2 kill swastiklab-backend
pm2 start ecosystem.config.js
```

## Dashboard

```bash
# Open web-based monitoring dashboard
npm run pm2:monitor
pm2 monitor

# Real-time CPU/Memory monitor
pm2 monit
```

---

## Status Icons

| Icon | Meaning | Action |
|------|---------|--------|
| 🟢 | Online | Running normally |
| 🔴 | Stopped | Process not running |
| 🟡 | One-launch | Just started |
| ⚠️ | Errored | Crashed/failed to start |
| ⏸️ | Stopped | Manually stopped |

---

## Quick Troubleshooting

**Backend not starting?**
```bash
npm run pm2:logs
tail -f logs/backend-error.log
```

**Port 5000 already in use?**
```bash
lsof -i :5000
kill -9 <PID>
```

**Restart hung process?**
```bash
pm2 kill
npm run pm2:start
```

**Check resource usage?**
```bash
pm2 monit
```

---

## Environment Variables

Set in `ecosystem.config.js`:
- `NODE_ENV` - 'development' or 'production'
- `PORT` - Server port (default: 5000)
- `DB_PATH` - Database file path

View current env:
```bash
pm2 info swastiklab-backend | grep env
```

---

## Logs Location

- **Output:** `/workspaces/swastiklab/logs/backend-out.log`
- **Errors:** `/workspaces/swastiklab/logs/backend-error.log`

View:
```bash
tail -f logs/backend-out.log
tail -f logs/backend-error.log
```

---

## Auto-Reload Settings

Watches these dirs for changes:
- `backend/app.js`
- `backend/routes/`
- `backend/services/`
- `backend/repositories/`
- `backend/middleware/`

Ignores:
- `backend/db/` (database files)
- `backend/uploads/`
- `backend/logs/`
- `logs/`
- `node_modules/`

---

## Memory & Restart Settings

- **Max Memory:** 500MB (auto-restart)
- **Min Uptime:** 10 seconds
- **Max Restarts:** 10

If exceeding memory or crashing frequently, adjust in `ecosystem.config.js`.

---

## File Locations

```
/workspaces/swastiklab/
├── ecosystem.config.js          # Main PM2 config
├── package.json                 # PM2 scripts added
├── logs/
│   ├── backend-out.log
│   └── backend-error.log
└── backend/
    └── app.js                   # Managed process
```

---

**Created:** February 9, 2026  
**PM2 Version:** 6.0.14  
**Status:** Ready to Use ✅
