# PM2 Integration in dev.js

## Overview

The `dev.js` launcher script has been enhanced to support optional PM2 process management. This allows you to choose between traditional process spawning and PM2-managed processes for more robust application monitoring and management.

## Features

### ✅ Dual Mode Operation
- **Default Mode**: Traditional process spawning (backward compatible)
- **PM2 Mode**: Production-grade process management with auto-restart, monitoring, and logging

### ✅ Automatic Fallback
- If PM2 is not installed or not available, automatically falls back to standard spawning
- No breaking changes to existing workflows

### ✅ Easy Activation
- Enable via CLI flag: `npm run dev -- --pm2`
- Enable via environment variable: `USE_PM2=true npm run dev`
- Disable with default: `npm run dev` (standard mode)

## Usage

### Standard Mode (Default)
```bash
# Traditional process spawning
npm run dev

# Both backend and frontend spawn as child processes
# Output shows combined logs from both services
# Stop with Ctrl+C
```

### PM2 Mode (Optional)
```bash
# Enable PM2 process management
npm run dev -- --pm2

# OR using environment variable
USE_PM2=true npm run dev
```

## What Happens in PM2 Mode?

### Startup Sequence
1. **Dependency Check** - Verifies npm, node, git
2. **Database Initialization** - Creates/verifies SQLite database
3. **PM2 Initialization** - Cleans up existing processes
4. **Backend Startup** - Starts backend with PM2 using ecosystem.config.js
5. **Monitoring Display** - Shows PM2 process status and management options

### Execution Flow
```
dev.js --pm2
  ↓
Check USE_PM2 flag ✓
  ↓
Check PM2 availability ✓
  ↓
startWithPM2(lanIp)
  ↓
pm2 delete all (cleanup)
  ↓
pm2 start ecosystem.config.js
  ↓
Display PM2 status and instructions
  ↓
Setup cleanup handlers
  ↓
Return from start() function
```

### Key Differences from Standard Mode

| Aspect | Standard Mode | PM2 Mode |
|--------|---------------|----------|
| Process Type | Child processes | PM2-managed processes |
| Auto-restart | No | Yes (on crash) |
| Memory Monitoring | No | Yes (500MB threshold) |
| Logging | Console output piped | File-based logs in ./logs/ |
| Hot-reload | Yes (via nodemon) | Yes (via ecosystem watch) |
| Multiple Services | 2 (Backend + Frontend) | 1 main (Backend via ecosystem) |
| Frontend Spawning | Yes | No (handled by npm scripts or separately) |

## PM2 Mode Configuration

### Ecosystem Configuration
- **File**: `ecosystem.config.js`
- **Port**: 5000 (Backend)
- **Name**: swastik_lab_backend
- **Mode**: fork
- **Max Memory**: 500MB
- **Auto-restart**: 10 max crashes with 10s min uptime
- **Watch**: Monitors backend routes, services, repositories, middleware
- **Ignore Watch**: Database files, uploads, tests, node_modules

### Log Files
When using PM2 mode, logs are written to:
- `./logs/swastik-app-out.log` - Standard output
- `./logs/swastik-app-error.log` - Error output
- Format: `YYYY-MM-DD HH:mm:ss Z [level] message`

## Process Management Commands

### When Running in PM2 Mode

View process status:
```bash
npm run pm2:status
pm2 status
```

View logs:
```bash
npm run pm2:logs
pm2 logs
```

Monitor processes:
```bash
npm run pm2:monitor
pm2 monit
```

Restart processes:
```bash
npm run pm2:restart
pm2 restart all
```

Stop processes:
```bash
npm run pm2:stop
pm2 stop all
```

Delete processes:
```bash
pm2 delete all
```

### When Running in Standard Mode

Stop with Ctrl+C

## Cleanup and Exit

### PM2 Mode Cleanup
```javascript
// Automatic cleanup on:
// - Ctrl+C (SIGINT)
// - Process termination (SIGTERM)
// - Process exit

cleanupPM2() {
    pm2 stop all
    pm2 delete all
    process.exit(0)
}
```

### Standard Mode Cleanup
```javascript
// Automatic cleanup on:
// - Ctrl+C (SIGINT)
// - Process termination (SIGTERM)
// - Process exit

cleanup() {
    Kill all child processes
    process.exit(0)
}
```

## Troubleshooting

### Problem: "PM2 not found"
**Solution**: Install PM2 globally
```bash
npm install -g pm2
```

### Problem: Port already in use
**Solution**: Ports are automatically killed before startup, but if issues persist:
```bash
# Kill port 5000
lsof -ti:5000 | xargs kill -9

# Kill port 3000
lsof -ti:3000 | xargs kill -9
```

### Problem: PM2 processes won't start
**Solution**: Run without PM2
```bash
npm run dev
```

### Problem: Backend starts but no output
**Check PM2 logs**:
```bash
npm run pm2:logs

# Or view error log directly
tail -f ./logs/swastik-app-error.log
```

### Problem: Cannot connect to backend in PM2 mode
**Check if PM2 process is running**:
```bash
pm2 status

# Check if port 5000 is listening
netstat -tuln | grep 5000

# Test connection
curl http://localhost:5000/health
```

## Environment Variables

### Available

| Variable | Type | Default | Purpose |
|----------|------|---------|---------|
| `USE_PM2` | string | 'false' | Enable PM2 mode ('true' or 'false') |
| `PORT` | number | 5000 | Backend port |
| `NODE_ENV` | string | 'development' | Environment |
| `REACT_APP_API_URL` | string | `http://{lanIp}:5000/api` | Frontend API endpoint |

### Setting Variables

```bash
# Via CLI flag
npm run dev -- --pm2

# Via environment variable
USE_PM2=true npm run dev

# Combined with other variables
NODE_ENV=development USE_PM2=true npm run dev
```

## Performance Considerations

### Standard Mode Advantages
- Lower memory overhead
- Direct console output (no file I/O delay)
- Simpler process management
- Good for development on resource-limited systems

### PM2 Mode Advantages
- Auto-restart on crash (better reliability)
- Memory monitoring (prevents memory bloat)
- Persistent logging
- Production-grade monitoring
- Process status tracking
- Better suited for longer development sessions

## Recommended Usage

- **Local Development**: Standard mode (`npm run dev`)
- **Extended Sessions**: PM2 mode (`npm run dev -- --pm2`)
- **Testing Stability**: PM2 mode with crash simulation
- **Production**: PM2 with ecosystem.config.js directly
- **Debugging**: Standard mode (easier to see console output)

## Technical Details

### Function: `checkPM2()`
```javascript
// Checks if PM2 is available when USE_PM2 flag is enabled
// Returns: true if PM2 found and working, false otherwise
// Also displays version number if found
```

### Function: `startWithPM2(lanIp)`
```javascript
// Initializes PM2 process management
// Steps:
// 1. Cleans up existing PM2 processes
// 2. Starts backend via ecosystem.config.js
// 3. Displays PM2 status after 2 seconds
// 4. Displays success message and instructions
// 5. Returns true on success, false on failure
```

### Updated `start()` Function
```javascript
// Now includes PM2 mode check:
// if (USE_PM2 && checkPM2()) {
//   startWithPM2(lanIp)
//   setupCleanupHandlers()
//   return
// }
//
// Falls back to standard spawning if PM2 unavailable
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
# Use standard mode in CI
- name: Start services
  run: npm run dev &
  timeout-minutes: 5
```

### Docker Example
```dockerfile
# Use PM2 in production container
ENV USE_PM2=true
CMD npm run dev -- --pm2
```

## Files Modified

- **dev.js**
  - Added `USE_PM2` configuration flag
  - Added `checkPM2()` function
  - Added `startWithPM2()` function
  - Modified `start()` function with conditional logic
  - Added PM2 cleanup handlers

## Related Files

- **ecosystem.config.js** - PM2 configuration file
- **package.json** - PM2 npm scripts
- **PM2_SETUP_GUIDE.md** - Comprehensive PM2 documentation
- **PM2_QUICK_REFERENCE.md** - Quick command reference

## Summary

The PM2 integration provides flexible process management while maintaining backward compatibility. Choose standard mode for simple development sessions and PM2 mode for extended work with better reliability and monitoring.

