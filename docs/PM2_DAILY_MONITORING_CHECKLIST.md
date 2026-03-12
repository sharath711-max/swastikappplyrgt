# PM2 Daily Monitoring Checklist

## Morning Check (Start of Day)

```bash
# 1. Verify process is running
npm run pm2:status

# 2. Check for any overnight crashes/restarts
npm run pm2:logs --lines 50

# 3. Verify port 5000 is accessible
curl http://localhost:5000/health  # If health endpoint exists

# 4. Check memory usage
pm2 monit                          # Or check logs
```

**Checklist:**
- [ ] Backend process showing "online"
- [ ] Memory usage < 200MB
- [ ] No recent error messages
- [ ] Server responding to requests

---

## Throughout the Day

### Every Hour
- [ ] Spot-check: `npm run pm2:status` - verify status is "online"

### When Code Changes
- [ ] Verify auto-reload worked: Check timestamp in `logs/backend-out.log`
- [ ] If not reloaded, manually: `npm run pm2:restart`

### If Issues Occur
```bash
# Check what went wrong
npm run pm2:logs --lines 100

# View detailed process info
pm2 info swastiklab-backend

# See memory/CPU
pm2 monit
```

---

## Evening Check (End of Day)

```bash
# 1. Verify everything is still running
npm run pm2:status

# 2. Check for any errors/warnings
npm run pm2:logs --lines 100

# 3. Check memory trajectory
tail -20 logs/backend-out.log

# 4. If production, save session
npm run pm2:save
```

**Checklist:**
- [ ] No critical errors in logs
- [ ] Memory usage stable (not growing over time)
- [ ] Process uptime looks good
- [ ] Ready for next day

---

## Weekly Check (Once Per Week)

### Monday Assessment
```bash
# Check if auto-restart is needed
npm run pm2:delete
npm run pm2:start

# Verify all systems healthy
npm run pm2:status
npm run pm2:monitor
```

**Tasks:**
- [ ] Review weekly logs for patterns
- [ ] Check if memory is growing (memory leak?)
- [ ] Verify error counts
- [ ] Have there been unusual restarts?

---

## Critical Error Response

### If Process is Down

```bash
# 1. Check what happened
npm run pm2:logs

# 2. Read error log
tail -50 logs/backend-error.log

# 3. Try restart
npm run pm2:restart

# 4. If still failing, check app directly
cd backend && node app.js

# 5. If needed, nuke and restart
npm run pm2:delete
npm run pm2:start
```

### If Memory is High (>400MB)

```bash
# Immediate action
npm run pm2:restart

# Check what's using memory
# Review code for memory leaks
# Monitor with: pm2 monit
```

### If Port 5000 is In Use

```bash
# Find what's using it
lsof -i :5000

# Kill the process
kill -9 <PID>

# Restart PM2
npm run pm2:restart
```

---

## Production Maintenance

### Weekly
- [ ] Review logs for errors
- [ ] Monitor performance metrics
- [ ] Check system resources
- [ ] Backup database

### Monthly
- [ ] Update dependencies
- [ ] Review error patterns
- [ ] Optimize performance if needed
- [ ] Update PM2: `npm install -g pm2@latest`

### Before Major Deployment
```bash
# 1. Test changes locally
cd backend && npm test

# 2. Plan minimal downtime
# 3. Use graceful reload (no connection loss)
npm run pm2:reload

# 4. Monitor logs after deployment
npm run pm2:logs --lines 100

# 5. Save new state
npm run pm2:save
```

---

## Key Logs to Monitor

### Normal Operation Messages
```
✅ Database initialized successfully
🚀 Server running on port 5000
[INFO] User logged in
[INFO] Data saved
```

### Warning Signs
```
[WARN] Connection slow
[ERROR] Database error
Connection refused
EADDRINUSE (port in use)
Memory usage high
```

### Critical Issues
```
[FATAL] Cannot start
Cannot find module
Out of memory
Database corrupted
```

---

## Performance Metrics

### Healthy Indicators
- ✅ CPU: 0-5% at idle
- ✅ Memory: 30-100MB
- ✅ Uptime: 24+ hours
- ✅ Restarts: 0-1 per week
- ✅ Response time: <500ms

### Warning Indicators
- ⚠️ CPU: 20-40% at idle
- ⚠️ Memory: 200-400MB
- ⚠️ Uptime: <1 hour (crashing frequently)
- ⚠️ Restarts: 5+ per day
- ⚠️ Response time: >2 seconds

### Critical Issues
- ❌ CPU: >50% consistently
- ❌ Memory: >500MB (triggers restart)
- ❌ Status: "Errored" or "Stopped"
- ❌ Uptime: <5 minutes
- ❌ Response time: No response

---

## Common Commands Quick Access

```bash
# Daily commands
npm run pm2:status                # Check status
npm run pm2:logs                  # View logs
npm run pm2:logs --lines 50       # Last 50 lines
npm run pm2:monitor               # Real-time dashboard

# Restart commands
npm run pm2:restart               # Restart process
npm run pm2:reload                # Graceful reload
npm run pm2:stop                  # Stop process
npm run pm2:start                 # Start process

# File access
tail -f logs/backend-out.log      # Watch output
tail -f logs/backend-error.log    # Watch errors
tail -20 logs/backend-out.log     # Last 20 lines

# System check
lsof -i :5000                     # Check port usage
pm2 monit                         # Monitor resources
pm2 info swastiklab-backend       # Detailed info
```

---

## Maintenance Schedule

### Daily
- [ ] Start of day status check
- [ ] Log review for errors
- [ ] Spot memory/CPU check
- [ ] End of day verification

### Weekly
- [ ] Full system restart
- [ ] Review all logs
- [ ] Performance analysis
- [ ] Backup verification

### Monthly
- [ ] Deep log analysis
- [ ] Performance tuning
- [ ] Dependency updates
- [ ] Documentation review

### Quarterly
- [ ] Major upgrades
- [ ] Performance optimization
- [ ] Security audit
- [ ] Capacity planning

---

## Emergency Contacts/Actions

If process keeps crashing:
1. Check logs: `npm run pm2:logs`
2. Test app: `cd backend && node app.js`
3. Check dependencies: `npm list` for issues
4. Check database: Ensure `backend/db/lab.db` exists
5. Check port: `lsof -i :5000`

If stuck, nuclear option:
```bash
# Kill PM2 completely
pm2 kill

# Restart from scratch
npm run pm2:delete
npm run pm2:start

# Verify
npm run pm2:status
```

---

## Documentation Links

- **Full Setup Guide:** PM2_SETUP_GUIDE.md
- **Quick Reference:** PM2_QUICK_REFERENCE.md  
- **Installation Summary:** PM2_INSTALLATION_SUMMARY.md
- **This Checklist:** PM2_DAILY_MONITORING_CHECKLIST.md

---

## Notes Section

Use this space to log issues and actions taken:

```
Date: [______________]
Issue: [______________________________________________]
Action Taken: [________________________________________]
Result: [______________________________________________]

Date: [______________]
Issue: [______________________________________________]
Action Taken: [________________________________________]
Result: [______________________________________________]
```

---

**Last Updated:** February 9, 2026  
**PM2 Version:** 6.0.14  
**Status:** Active Monitoring ✅

Use this checklist as your daily guide for keeping the project running smoothly!
