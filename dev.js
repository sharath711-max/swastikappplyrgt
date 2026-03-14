// File Path: dev.js
// Swastik Gold & Silver Lab - Development Launcher
const { spawn, execSync, spawnSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Configuration
const USE_PM2 = process.argv.includes('--pm2') || process.env.USE_PM2 === 'true';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m'
};

/**
 * Print formatted message
 */
function log(message, color = colors.white, prefix = '') {
    console.log(`${color}${prefix}${message}${colors.reset}`);
}

/**
 * Print header
 */
function printHeader() {
    console.log('\n'.repeat(2));
    log('=================================================', colors.cyan, '  ');
    log('     SWASTIK GOLD & SILVER LAB v2.0.0           ', colors.bright + colors.cyan, '  ');
    log('=================================================', colors.cyan, '  ');
    console.log('\n');
}

/**
 * Kill processes on specific ports (Cross-platform)
 */
function killPorts(ports) {
    log(`🔧 Step 1: Cleaning up ports ${ports.join(', ')}...`, colors.yellow);

    const platform = os.platform();

    ports.forEach((port) => {
        try {
            if (platform === 'win32') {
                // Windows
                const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
                const lines = stdout.trim().split('\n');
                const pids = new Set();

                lines.forEach((line) => {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && /^\d+$/.test(pid) && pid !== '0') {
                        pids.add(pid);
                    }
                });

                pids.forEach((pid) => {
                    try {
                        // Use native Node.js process kill to avoid taskkill subprocess hanging
                        process.kill(parseInt(pid), 'SIGKILL');
                        log(`✓ Terminated process ${pid} on port ${port}`, colors.green);
                    } catch (e) {
                        // Process already gone or Access Denied
                    }
                });
            } else {
                // Linux/Mac
                try {
                    const pid = execSync(`lsof -ti:${port}`).toString().trim();
                    if (pid) {
                        execSync(`kill -9 ${pid}`);
                        log(`✓ Terminated process ${pid} on port ${port}`, colors.green);
                    }
                } catch (e) {
                    // Port not in use
                }
            }
        } catch (err) {
            // Port likely not in use
        }
    });

    log('✓ Port cleanup completed', colors.green);
}

/**
 * Check and install dependencies
 */
function checkDependencies() {
    log(`📦 Step 2: Checking dependencies...`, colors.yellow);

    const dirs = [
        { name: 'Root', path: '.' },
        { name: 'Backend', path: 'backend' },
        { name: 'Frontend', path: 'frontend' }
    ];

    let allInstalled = true;

    dirs.forEach((dir) => {
        const packagePath = path.join(__dirname, dir.path, 'package.json');
        const nodeModulesPath = path.join(__dirname, dir.path, 'node_modules');

        if (!fs.existsSync(packagePath)) {
            log(`⚠  Skipping ${dir.name} (no package.json)`, colors.yellow);
            return;
        }

        if (!fs.existsSync(nodeModulesPath)) {
            log(`📥 Installing dependencies in ${dir.name}...`, colors.cyan);
            try {
                spawnSync('npm', ['install', '--no-audit', '--progress=false'], {
                    cwd: path.join(__dirname, dir.path),
                    stdio: 'inherit',
                    shell: true,
                    timeout: 300000 // 5 minutes timeout
                });
                log(`✓ ${dir.name} dependencies installed`, colors.green);
            } catch (error) {
                log(`❌ Failed to install dependencies in ${dir.name}`, colors.red);
                allInstalled = false;
            }
        } else {
            log(`✓ ${dir.name} dependencies already installed`, colors.green);
        }
    });

    return allInstalled;
}

/**
 * LAN IP Discovery
 */
function getLanIp() {
    const networkInterfaces = os.networkInterfaces();
    let lanIp = '127.0.0.1';
    let candidates = [];

    for (const name in networkInterfaces) {
        for (const iface of networkInterfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // Prioritize 192.168.x.x (Common Home/Office LAN)
                if (iface.address.startsWith('192.168.')) {
                    return iface.address;
                }
                // Store others as fallback
                candidates.push(iface.address);
            }
        }
    }

    // Fallback order: 10.0.0.0/8 -> 172.16.0.0/12 -> First found
    if (candidates.length > 0) {
        const tenSeries = candidates.find(ip => ip.startsWith('10.'));
        if (tenSeries) return tenSeries;
        return candidates[0];
    }

    return lanIp;
}

/**
 * Check if PM2 is available
 */
function checkPM2() {
    if (!USE_PM2) {
        return false;
    }

    try {
        const result = spawnSync('pm2', ['--version'], {
            stdio: 'pipe',
            timeout: 5000
        });

        if (result.status === 0) {
            const version = result.stdout.toString().trim();
            log(`✓ PM2 found (v${version})`, colors.green);
            return true;
        }
    } catch (error) {
        log('⚠  PM2 not found, falling back to standard spawn', colors.yellow);
    }

    return false;
}

/**
 * Start services with PM2
 */
function startWithPM2(lanIp) {
    log('🚀 Using PM2 Process Manager...', colors.cyan);

    try {
        // Delete any existing processes
        try {
            execSync('pm2 delete all', { stdio: 'pipe' });
        } catch (e) {
            // Ignore if no processes exist
        }

        // Start backend with PM2
        log('🟢 Starting Backend with PM2...', colors.green);
        execSync('pm2 start ecosystem.config.js', {
            stdio: 'pipe',
            cwd: __dirname
        });

        // Wait for backend to stabilize
        setTimeout(() => {
            log('✓ Backend started via PM2', colors.green);

            // Display PM2 status
            console.log('\n');
            try {
                execSync('pm2 status', { stdio: 'inherit' });
            } catch (e) {
                // Ignore
            }
        }, 2000);

        // Display success and instructions
        setTimeout(() => {
            console.log('\n\n');
            log('=================================================', colors.bright + colors.green);
            log('     ✅ SWASTIK GOLD & SILVER LAB ONLINE         ', colors.bright + colors.green);
            log('       (Running with PM2 Process Manager)        ', colors.bright + colors.green);
            log('=================================================', colors.bright + colors.green);
            console.log('\n');

            log('📡 ACCESS LINKS:', colors.cyan);
            log(`   Backend API:    http://localhost:5000`, colors.white);
            log(`   Health Check:   http://localhost:5000/health`, colors.dim);
            console.log('\n');

            log('🌐 NETWORK ACCESS:', colors.cyan);
            log(`   Backend API:    http://${lanIp}:5000`, colors.white);
            console.log('\n');

            log('📊 PM2 MANAGEMENT:', colors.cyan);
            log(`   View status:    npm run pm2:status`, colors.white);
            log(`   View logs:      npm run pm2:logs`, colors.white);
            log(`   Monitor:        npm run pm2:monitor`, colors.white);
            log(`   Restart:        npm run pm2:restart`, colors.white);
            log(`   Stop:           npm run pm2:stop`, colors.white);
            console.log('\n');

            log('🔐 DEFAULT CREDENTIALS:', colors.cyan);
            log(`   Username: admin`, colors.white);
            log(`   Password: admin123`, colors.white);
            console.log('\n');

            log('🛑 TO STOP: Use "npm run pm2:stop" or "pm2 stop all"', colors.yellow);
            log('=================================================', colors.dim);
            console.log('\n\n');
        }, 4000);

        return true;

    } catch (error) {
        log(`❌ PM2 startup failed: ${error.message}`, colors.red);
        log('Falling back to standard spawn...', colors.yellow);
        return false;
    }
}

/**
 * Check database initialization
 */
function checkDatabase() {
    log(`🗄️  Step 3: Checking database...`, colors.yellow);

    const dbPath = path.join(__dirname, 'backend', 'db', 'lab.db');
    const dbDir = path.dirname(dbPath);

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        log('✓ Created database directory', colors.green);
    }

    if (!fs.existsSync(dbPath)) {
        log('📊 Initializing database...', colors.cyan);

        // Check if init.sql exists
        const initSqlPath = path.join(__dirname, 'backend', 'db', 'init.sql');
        if (!fs.existsSync(initSqlPath)) {
            log('❌ init.sql not found in backend/db/', colors.red);
            return false;
        }

        try {
            // Initialize database using the existing db.js
            const { initDb } = require('./backend/db/db');
            initDb();
            log('✓ Database initialized successfully', colors.green);
            return true;
        } catch (error) {
            log(`❌ Database initialization failed: ${error.message}`, colors.red);
            return false;
        }
    } else {
        log('✓ Database exists and ready', colors.green);
        return true;
    }
}

function startFrontendProcess(processes, lanIp) {
    log('Starting Frontend (port 3000)...', colors.green);

    try {
        const clientEnv = {
            ...process.env,
            HOST: '0.0.0.0',
            PORT: '3000',
            BROWSER: 'none',
            REACT_APP_API_URL: `http://${lanIp}:5000/api`,
            REACT_APP_LAN_IP: lanIp,
            GENERATE_SOURCEMAP: 'false'
        };

        const client = spawn('npm', ['start'], {
            cwd: path.join(__dirname, 'frontend'),
            stdio: 'pipe',
            shell: true,
            env: clientEnv
        });

        processes.push(client);

        client.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output.includes('Compiled successfully')) {
                log(`Frontend started: ${output}`, colors.green);
            }
            console.log(`[Frontend] ${output}`);
        });

        client.stderr.on('data', (data) => {
            console.error(`[Frontend Error] ${data.toString().trim()}`);
        });

        client.on('error', (err) => {
            log(`Frontend failed to start: ${err.message}`, colors.red);
        });

    } catch (error) {
        log(`Failed to start frontend: ${error.message}`, colors.red);
    }
}

function startBackendProcess(processes, lanIp) {
    log('\nStarting Backend (port 5000)...', colors.green);

    try {
        const corsAllowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            `http://${lanIp}:3000`
        ].join(',');

        const server = spawn('npm', ['run', 'dev'], {
            cwd: path.join(__dirname, 'backend'),
            stdio: 'pipe',
            shell: true,
            env: {
                ...process.env,
                PORT: '5000',
                HOST: '0.0.0.0',
                NODE_ENV: 'development',
                CORS_ALLOWED_ORIGINS: corsAllowedOrigins
            }
        });

        processes.push(server);

        server.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output.includes('Server running')) {
                log(`Backend started: ${output}`, colors.green);
            }
            console.log(`[Backend] ${output}`);
        });

        server.stderr.on('data', (data) => {
            console.error(`[Backend Error] ${data.toString().trim()}`);
        });

        server.on('error', (err) => {
            log(`Backend failed to start: ${err.message}`, colors.red);
        });

    } catch (error) {
        log(`Failed to start backend: ${error.message}`, colors.red);
    }
}

/**
 * Start the application
 */
async function start() {
    printHeader();

    const lanIp = getLanIp();
    log(`🌐 LAN IP Address: ${lanIp}`, colors.cyan);
    log(`💻 Platform: ${os.platform()} ${os.arch()}`, colors.dim);
    log(`📅 ${new Date().toLocaleString()}`, colors.dim);

    console.log('\n');

    // 1. Kill ports
    killPorts([3000, 5000]);

    // 2. Check dependencies
    const depsOk = checkDependencies();
    if (!depsOk) {
        log('⚠  Dependency check had issues, but continuing...', colors.yellow);
    }

    // 3. Check database
    const dbOk = checkDatabase();
    if (!dbOk) {
        log('⚠  Database initialization had issues, but continuing...', colors.yellow);
    }

    console.log('\n');
    log('🚀 Step 4: Launching services...', colors.yellow);
    console.log('\n');

    // Check if PM2 is available and use it if enabled
    if (USE_PM2 && checkPM2()) {
        startWithPM2(lanIp);

        // Setup PM2 cleanup handlers
        function cleanupPM2() {
            log('\n🔴 Shutting down services...', colors.red);
            try {
                execSync('pm2 stop all', { stdio: 'pipe' });
                execSync('pm2 delete all', { stdio: 'pipe' });
            } catch (e) {
                // Ignore
            }
            setTimeout(() => process.exit(0), 1000);
        }

        process.on('SIGINT', cleanupPM2);
        process.on('SIGTERM', cleanupPM2);
        process.on('exit', cleanupPM2);

        return;
    }

    // Standard process spawning (fallback or default mode)
    log('🚀 Using Standard Process Spawning...', colors.cyan);

    // Store child process references for cleanup
    const processes = [];

    // Function to handle exit
    function cleanup() {
        log('\n🔴 Shutting down services...', colors.red);
        processes.forEach(proc => {
            try {
                proc.kill('SIGTERM');
            } catch (e) {
                // Ignore
            }
        });
        setTimeout(() => process.exit(0), 1000);
    }

    // Handle process termination
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

    startFrontendProcess(processes, lanIp);

    // Wait a bit before starting backend
    await new Promise(resolve => setTimeout(resolve, 2000));

    startBackendProcess(processes, lanIp);

    if (false) {
    // Start Backend
    log('🟢 Starting Backend (port 5000)...', colors.green);
    try {
        const server = spawn('npm', ['run', 'dev'], {
            cwd: path.join(__dirname, 'backend'),
            stdio: 'pipe',
            shell: true,
            env: {
                ...process.env,
                PORT: '5000',
                HOST: '0.0.0.0',
                NODE_ENV: 'development'
            }
        });

        processes.push(server);

        server.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output.includes('Server running')) {
                log(`✓ Backend started: ${output}`, colors.green);
            }
            console.log(`[Backend] ${output}`);
        });

        server.stderr.on('data', (data) => {
            console.error(`[Backend Error] ${data.toString().trim()}`);
        });

        server.on('error', (err) => {
            log(`❌ Backend failed to start: ${err.message}`, colors.red);
        });

    } catch (error) {
        log(`❌ Failed to start backend: ${error.message}`, colors.red);
    }

    // Wait a bit before starting frontend
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start Frontend
    log('\n🟢 Starting Frontend (port 3000)...', colors.green);
    try {
        const clientEnv = {
            ...process.env,
            HOST: '0.0.0.0', // Bind to all interfaces — localhost AND LAN IP both work
            PORT: '3000',
            BROWSER: 'none',
            REACT_APP_API_URL: `http://${lanIp}:5000/api`,
            REACT_APP_LAN_IP: lanIp,
            GENERATE_SOURCEMAP: 'false'
        };

        const client = spawn('npm', ['start'], {
            cwd: path.join(__dirname, 'frontend'),
            stdio: 'pipe',
            shell: true,
            env: clientEnv
        });

        processes.push(client);

        client.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output.includes('Compiled successfully')) {
                log(`✓ Frontend started: ${output}`, colors.green);
            }
            console.log(`[Frontend] ${output}`);
        });

        client.stderr.on('data', (data) => {
            console.error(`[Frontend Error] ${data.toString().trim()}`);
        });

        client.on('error', (err) => {
            log(`❌ Frontend failed to start: ${err.message}`, colors.red);
        });

    } catch (error) {
        log(`❌ Failed to start frontend: ${error.message}`, colors.red);
    }
    }

    // Display success message after both services are (hopefully) running
    setTimeout(() => {
        console.log('\n\n');
        log('=================================================', colors.bright + colors.green);
        log('     ✅ SWASTIK GOLD & SILVER LAB ONLINE         ', colors.bright + colors.green);
        log('=================================================', colors.bright + colors.green);
        console.log('\n');

        log('📡 ACCESS LINKS:', colors.cyan);
        log(`   Backend API:    http://localhost:5000`, colors.white);
        log(`   Frontend App:   http://localhost:3000`, colors.white);
        log(`   Health Check:   http://localhost:5000/health`, colors.dim);
        console.log('\n');

        log('🌐 NETWORK ACCESS:', colors.cyan);
        log(`   Backend API:    http://${lanIp}:5000`, colors.white);
        log(`   Frontend App:   http://${lanIp}:3000`, colors.white);
        console.log('\n');

        log('🔐 DEFAULT CREDENTIALS:', colors.cyan);
        log(`   Username: admin`, colors.white);
        log(`   Password: admin123`, colors.white);
        console.log('\n');

        log('🛑 TO STOP: Press Ctrl + C', colors.yellow);
        log('=================================================', colors.dim);
        console.log('\n\n');
    }, 5000);
}

// Error handling for the script itself
process.on('uncaughtException', (err) => {
    log(`❌ Uncaught Exception: ${err.message}`, colors.red);
    console.error(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`❌ Unhandled Rejection at: ${promise}`, colors.red);
    console.error('Reason:', reason);
});

// Start the application
start();
