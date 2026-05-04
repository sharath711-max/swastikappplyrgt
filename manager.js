'use strict';
// Swastik Gold & Silver Lab - System Manager
// Run: node manager.js
// Open: http://localhost:9000

const http = require('http');
const crypto = require('crypto');
const { exec, spawn, execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const MANAGER_PORT = Number(process.env.MANAGER_PORT || 9000);
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 5000);
const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 3000);
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const ROOT = __dirname;
const BACKEND_DIR = path.join(ROOT, 'backend');
const FRONTEND_DIR = path.join(ROOT, 'frontend');
const DB_PATH = process.env.DB_PATH
  ? path.resolve(ROOT, process.env.DB_PATH)
  : path.join(BACKEND_DIR, 'db', 'lab.db');

let backendProc = null;
let frontendProc = null;
let lastLanIp = null;

const sessions = new Map();
const sseClients = new Set();
const logBuffer = [];

function pushLog(source, text, level = 'info') {
  const lines = String(text || '').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const entry = { source, text: line, level, t: Date.now() };
    logBuffer.push(entry);
    if (logBuffer.length > 600) logBuffer.shift();
    const msg = `data: ${JSON.stringify(entry)}\n\n`;
    for (const res of sseClients) {
      try { res.write(msg); } catch { sseClients.delete(res); }
    }
  }
}

function getLanIp() {
  const nets = os.networkInterfaces();
  const candidates = [];
  for (const addrs of Object.values(nets)) {
    for (const addr of addrs || []) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      if (addr.address.startsWith('192.168.') || addr.address.startsWith('10.')) {
        candidates.unshift(addr.address);
      } else {
        candidates.push(addr.address);
      }
    }
  }
  return candidates[0] || '127.0.0.1';
}

function killPort(port) {
  return new Promise(resolve => {
    if (os.platform() !== 'win32') {
      exec(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, () => resolve());
      return;
    }
    exec(`netstat -ano | findstr :${port}`, (_error, out) => {
      if (!out) return resolve();
      const pids = new Set(
        out.trim().split('\n')
          .map(line => line.trim().split(/\s+/).pop())
          .filter(pid => /^\d+$/.test(pid) && pid !== '0')
      );
      if (!pids.size) return resolve();
      let pending = pids.size;
      for (const pid of pids) {
        exec(`taskkill /F /PID ${pid} 2>nul`, () => {
          pending -= 1;
          if (pending === 0) resolve();
        });
      }
    });
  });
}

function getNodeInfo() {
  try {
    const node = execSync('node --version', { encoding: 'utf8', timeout: 3000 }).trim();
    const npm = execSync('npm --version', { encoding: 'utf8', timeout: 3000 }).trim();
    return { node, npm, installed: true };
  } catch {
    return { node: null, npm: null, installed: false };
  }
}

function openAuthDb() {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database not found: ${DB_PATH}`);
  }
  return new Database(DB_PATH, { readonly: true, fileMustExist: true });
}

async function authenticateSuperAdmin(username, password) {
  const db = openAuthDb();
  try {
    const user = db.prepare(
      'SELECT id, username, password, role FROM users WHERE username = ? AND deletedon IS NULL'
    ).get(String(username || '').trim());
    if (!user) return null;
    const ok = await bcrypt.compare(String(password || ''), user.password);
    if (!ok || user.role !== 'superadmin') return null;
    return { id: user.id, username: user.username, role: user.role };
  } finally {
    db.close();
  }
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(
    raw.split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const index = part.indexOf('=');
        return index === -1 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function getSession(req) {
  const token = parseCookies(req).manager_session;
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return session;
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { user, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function requireSession(req, res) {
  const session = getSession(req);
  if (session) return session;
  sendJson(res, { ok: false, error: 'Authentication required' }, 401);
  return null;
}

function sendSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `manager_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'manager_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
}

function startBackend() {
  if (backendProc) {
    pushLog('mgr', 'Backend already running', 'warn');
    return;
  }

  const lanIp = getLanIp();
  pushLog('mgr', `Starting backend on port ${BACKEND_PORT}`);

  killPort(BACKEND_PORT).then(() => {
    const corsOrigins = [
      `http://localhost:${FRONTEND_PORT}`,
      `http://127.0.0.1:${FRONTEND_PORT}`,
      `http://${lanIp}:${FRONTEND_PORT}`,
    ].join(',');

    backendProc = spawn('node', ['app.js'], {
      cwd: BACKEND_DIR,
      env: {
        ...process.env,
        PORT: String(BACKEND_PORT),
        HOST: '0.0.0.0',
        NODE_ENV: 'development',
        CORS_ALLOWED_ORIGINS: corsOrigins,
      },
    });

    backendProc.stdout.on('data', data => pushLog('backend', data.toString()));
    backendProc.stderr.on('data', data => pushLog('backend', data.toString(), 'error'));
    backendProc.on('exit', code => {
      pushLog('mgr', `Backend exited (code ${code})`, code === 0 ? 'info' : 'error');
      backendProc = null;
    });
    pushLog('mgr', 'Backend process started', 'success');
  });
}

function stopBackend() {
  if (!backendProc) {
    pushLog('mgr', 'Backend is not running', 'warn');
    return;
  }
  pushLog('mgr', 'Stopping backend', 'warn');
  backendProc.kill('SIGTERM');
  setTimeout(() => { if (backendProc) backendProc.kill('SIGKILL'); }, 4000);
}

function startFrontend() {
  if (frontendProc) {
    pushLog('mgr', 'Frontend already running', 'warn');
    return;
  }

  const lanIp = getLanIp();
  pushLog('mgr', `Starting frontend on port ${FRONTEND_PORT}`);

  killPort(FRONTEND_PORT).then(() => {
    frontendProc = spawn('npm', ['start'], {
      cwd: FRONTEND_DIR,
      shell: true,
      env: {
        ...process.env,
        HOST: '0.0.0.0',
        PORT: String(FRONTEND_PORT),
        BROWSER: 'none',
        REACT_APP_API_URL: `http://${lanIp}:${BACKEND_PORT}/api`,
        GENERATE_SOURCEMAP: 'false',
      },
    });

    frontendProc.stdout.on('data', data => pushLog('frontend', data.toString()));
    frontendProc.stderr.on('data', data => {
      const text = data.toString();
      pushLog('frontend', text, text.toLowerCase().includes('error') ? 'error' : 'info');
    });
    frontendProc.on('exit', code => {
      pushLog('mgr', `Frontend exited (code ${code})`, code === 0 ? 'info' : 'error');
      frontendProc = null;
    });
    pushLog('mgr', 'Frontend process started', 'success');
  });
}

function stopFrontend() {
  if (!frontendProc) {
    pushLog('mgr', 'Frontend is not running', 'warn');
    return;
  }
  pushLog('mgr', 'Stopping frontend', 'warn');
  frontendProc.kill('SIGTERM');
  setTimeout(() => { if (frontendProc) frontendProc.kill('SIGKILL'); }, 4000);
}

function installPackages(target) {
  const map = {
    root: { dir: ROOT, label: 'Root' },
    backend: { dir: BACKEND_DIR, label: 'Backend' },
    frontend: { dir: FRONTEND_DIR, label: 'Frontend' },
  };
  const keys = target === 'all' ? ['root', 'backend', 'frontend'] : [target];
  if (keys.some(key => !map[key])) {
    pushLog('install', `Unknown install target: ${target}`, 'error');
    return;
  }

  pushLog('mgr', `Installing packages for ${keys.join(', ')}`);

  function next(index) {
    if (index >= keys.length) {
      pushLog('mgr', 'All installs complete', 'success');
      return;
    }
    const { dir, label } = map[keys[index]];
    pushLog('install', `npm install -> ${label}`);
    const proc = spawn('npm', ['install', '--no-audit', '--progress=false'], { cwd: dir, shell: true });
    proc.stdout.on('data', data => pushLog('install', data.toString()));
    proc.stderr.on('data', data => pushLog('install', data.toString(), 'warn'));
    proc.on('exit', code => {
      pushLog('install', `${label} done (exit ${code})`, code === 0 ? 'success' : 'error');
      next(index + 1);
    });
  }

  next(0);
}

function doBackup() {
  pushLog('mgr', 'Starting database backup');
  const proc = spawn('node', ['utils/backup.js'], { cwd: BACKEND_DIR });
  proc.stdout.on('data', data => pushLog('backup', data.toString(), 'success'));
  proc.stderr.on('data', data => pushLog('backup', data.toString(), 'warn'));
  proc.on('exit', code => pushLog('mgr', `Backup finished (exit ${code})`, code === 0 ? 'success' : 'error'));
}

function networkRefreshAndRestart(reason = 'manual refresh') {
  const ip = getLanIp();
  pushLog('mgr', `Network refresh (${reason}) - LAN IP: ${ip}`);

  const wasBackend = !!backendProc;
  const wasFrontend = !!frontendProc;

  if (wasBackend) stopBackend();
  if (wasFrontend) stopFrontend();

  const delay = (wasBackend || wasFrontend) ? 5000 : 0;
  if (wasBackend) setTimeout(startBackend, delay);
  if (wasFrontend) setTimeout(startFrontend, delay + 1500);
}

function monitorNetwork() {
  const ip = getLanIp();
  if (!lastLanIp) {
    lastLanIp = ip;
    return;
  }
  if (ip === lastLanIp) return;
  const previous = lastLanIp;
  lastLanIp = ip;
  pushLog('mgr', `Network change detected: ${previous} -> ${ip}`, 'warn');
  networkRefreshAndRestart('IP change detected');
}

function checkPort(port, pathname) {
  return new Promise(resolve => {
    const req = http.get({ hostname: '127.0.0.1', port, path: pathname, timeout: 3000 }, res => {
      res.resume();
      resolve({ ok: res.statusCode < 500, code: res.statusCode });
    });
    req.on('error', () => resolve({ ok: false, code: null }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, code: 'timeout' });
    });
  });
}

function openBrowser(url) {
  const cmd = os.platform() === 'win32'
    ? `start "" "${url}"`
    : os.platform() === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;
  exec(cmd);
  pushLog('mgr', `Browser opened -> ${url}`);
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let buffer = '';
    req.on('data', data => { buffer += data; });
    req.on('end', () => {
      try { resolve(JSON.parse(buffer || '{}')); } catch { resolve({}); }
    });
  });
}

function lastBackupInfo() {
  const backupDirs = [
    path.join(BACKEND_DIR, 'backups'),
    path.join(ROOT, 'backups'),
  ];
  const files = [];

  for (const backupDir of backupDirs) {
    try {
      for (const name of fs.readdirSync(backupDir)) {
        if (!name.endsWith('.db') && !name.endsWith('.sqlite') && !name.endsWith('.zip')) continue;
        const fullPath = path.join(backupDir, name);
        const stat = fs.statSync(fullPath);
        files.push({ name, time: new Date(stat.mtimeMs).toISOString(), dir: backupDir, mt: stat.mtimeMs });
      }
    } catch {
      // Missing backup folders are normal on fresh installs.
    }
  }

  files.sort((a, b) => b.mt - a.mt);
  return files[0] || null;
}

async function statusPayload() {
  const nodeInfo = getNodeInfo();
  const [backendHealth, frontendHealth] = await Promise.all([
    checkPort(BACKEND_PORT, '/health'),
    checkPort(FRONTEND_PORT, '/'),
  ]);

  return {
    ...nodeInfo,
    backend: { running: !!backendProc, health: backendHealth, pid: backendProc?.pid || null },
    frontend: { running: !!frontendProc, health: frontendHealth, pid: frontendProc?.pid || null },
    ip: getLanIp(),
    backendPort: BACKEND_PORT,
    frontendPort: FRONTEND_PORT,
    platform: `${os.platform()} ${os.arch()}`,
    memory: {
      used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
      total: Math.round(os.totalmem() / 1024 / 1024),
    },
    database: DB_PATH,
    lastBackup: lastBackupInfo(),
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${MANAGER_PORT}`);
  const pathname = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (pathname === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(buildHtml(Boolean(getSession(req))));
  }

  if (pathname === '/api/login' && method === 'POST') {
    const body = await readBody(req);
    try {
      const user = await authenticateSuperAdmin(body.username, body.password);
      if (!user) return sendJson(res, { ok: false, error: 'Only a superadmin account can open this utility.' }, 403);
      const token = createSession(user);
      sendSessionCookie(res, token);
      pushLog('mgr', `Manager login: ${user.username}`, 'success');
      return sendJson(res, { ok: true, user });
    } catch (error) {
      pushLog('mgr', error.message, 'error');
      return sendJson(res, { ok: false, error: error.message }, 500);
    }
  }

  if (pathname === '/api/logout' && method === 'POST') {
    const token = parseCookies(req).manager_session;
    if (token) sessions.delete(token);
    clearSessionCookie(res);
    return sendJson(res, { ok: true });
  }

  if (pathname === '/api/me' && method === 'GET') {
    const session = getSession(req);
    return sendJson(res, { ok: Boolean(session), user: session?.user || null });
  }

  const session = requireSession(req, res);
  if (!session) return;

  if (pathname === '/api/stream' && method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    sseClients.add(res);
    for (const entry of logBuffer) res.write(`data: ${JSON.stringify(entry)}\n\n`);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  if (pathname === '/api/status' && method === 'GET') {
    return sendJson(res, await statusPayload());
  }

  if (method === 'POST') {
    const body = await readBody(req);

    if (pathname === '/api/server/start') { startBackend(); return sendJson(res, { ok: true }); }
    if (pathname === '/api/server/stop') { stopBackend(); return sendJson(res, { ok: true }); }
    if (pathname === '/api/client/start') { startFrontend(); return sendJson(res, { ok: true }); }
    if (pathname === '/api/client/stop') { stopFrontend(); return sendJson(res, { ok: true }); }
    if (pathname === '/api/both/start') {
      startBackend();
      setTimeout(startFrontend, 2000);
      return sendJson(res, { ok: true });
    }
    if (pathname === '/api/both/stop') {
      stopBackend();
      stopFrontend();
      return sendJson(res, { ok: true });
    }
    if (pathname === '/api/install') { installPackages(body.target || 'all'); return sendJson(res, { ok: true }); }
    if (pathname === '/api/backup') { doBackup(); return sendJson(res, { ok: true }); }
    if (pathname === '/api/browser') {
      openBrowser(`http://${getLanIp()}:${FRONTEND_PORT}`);
      return sendJson(res, { ok: true });
    }
    if (pathname === '/api/network/restart') {
      networkRefreshAndRestart('manual');
      return sendJson(res, { ok: true, ip: getLanIp() });
    }
  }

  res.writeHead(404);
  res.end('Not found');
});

function buildHtml(isLoggedIn) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Swastik Lab Manager</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#101216;--panel:#171a20;--panel2:#20242c;--border:#2d333d;--text:#eef2f7;--muted:#9aa4b2;--green:#22c55e;--red:#ef4444;--yellow:#f59e0b;--blue:#3b82f6;--purple:#7c3aed;--cyan:#06b6d4;--accent:#f6c453}
body{min-height:100vh;background:var(--bg);color:var(--text);font:14px/1.55 Segoe UI,system-ui,sans-serif}
button,input{font:inherit}
.hidden{display:none!important}
header{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:10px 20px;background:var(--panel);border-bottom:1px solid var(--border)}
header h1{font-size:16px;color:var(--accent);white-space:nowrap}
.hbadges{display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex:1}
.badge{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:var(--panel2);border:1px solid var(--border)}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}.dot.green{background:var(--green);box-shadow:0 0 7px var(--green)}.dot.red{background:var(--red);box-shadow:0 0 7px var(--red)}.dot.yellow{background:var(--yellow);box-shadow:0 0 7px var(--yellow);animation:blink 1.2s infinite}.dot.grey{background:var(--muted)}@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
main{padding:14px 18px;display:grid;gap:14px;max-width:1440px;margin:0 auto}
.row{display:grid;gap:14px}.g2{grid-template-columns:1fr 1fr}.g4{grid-template-columns:repeat(4,1fr)}@media(max-width:1100px){.g4{grid-template-columns:1fr 1fr}}@media(max-width:760px){.g2,.g4{grid-template-columns:1fr}}
.card,.login-card{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:14px 16px}.ctitle{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:11px}.cbody{display:flex;flex-direction:column;gap:8px}
.srow{display:flex;align-items:center;justify-content:space-between;gap:8px}.slbl{color:var(--muted);font-size:12px}.sval{font-weight:700;font-size:12px;text-align:right;word-break:break-word}.bigst{display:flex;align-items:center;gap:9px;margin-bottom:10px}.bigst .dot{width:13px;height:13px}.bigst-txt{font-size:17px;font-weight:800}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:7px 14px;border:0;border-radius:7px;font-size:13px;font-weight:800;cursor:pointer;transition:filter .12s,opacity .12s;white-space:nowrap;text-decoration:none;color:#fff}.btn:disabled{opacity:.45;cursor:not-allowed}.btn:not(:disabled):hover{filter:brightness(1.12)}.btn.green{background:#16a34a}.btn.red{background:#dc2626}.btn.blue{background:#2563eb}.btn.purple{background:#7c3aed}.btn.yellow{background:#b45309}.btn.cyan{background:#0891b2}.btn.indigo{background:#4f46e5}.btn.ghost{background:var(--panel2);border:1px solid var(--border);color:var(--text)}.btn.sm{padding:4px 10px;font-size:12px}.btn.full{width:100%}.btn-row{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.grid-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}
.ip-big{font-size:22px;font-weight:800;color:var(--cyan);font-family:Consolas,monospace;line-height:1.2}.url-row{font-size:11px;font-family:Consolas,monospace;margin-top:3px}.url-be{color:#60a5fa}.url-fe{color:#4ade80}
.logpanel{background:var(--panel);border:1px solid var(--border);border-radius:8px;overflow:hidden}.loghdr{padding:9px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;flex-wrap:wrap}.logtabs{display:flex;gap:4px;flex-wrap:wrap}.ltab{padding:3px 11px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;background:var(--panel2);border:1px solid var(--border);color:var(--muted)}.ltab.on{background:#2563eb;border-color:#2563eb;color:#fff}.logacts{margin-left:auto;display:flex;gap:6px;align-items:center}.logbody{height:300px;overflow-y:auto;padding:8px 12px;font:12px/1.5 Consolas,Cascadia Code,monospace;background:#080a0f}.ll{display:flex;gap:7px;padding:1px 0}.lt{color:#525c6c;white-space:nowrap;font-size:11px}.ls{padding:1px 5px;border-radius:3px;font-size:10px;font-weight:800;white-space:nowrap}.ls.backend{background:#1e3a5f;color:#60a5fa}.ls.frontend{background:#14351f;color:#4ade80}.ls.mgr{background:#35245f;color:#c4b5fd}.ls.install{background:#3b2d12;color:#fbbf24}.ls.backup{background:#1f3a18;color:#86efac}.lx{color:#c3cad6;word-break:break-word}.lx.error{color:#f87171}.lx.success{color:#4ade80}.lx.warn{color:#fbbf24}
.htag{padding:2px 8px;border-radius:4px;font-size:11px;font-weight:800}.htag.ok{background:#14532d;color:#4ade80}.htag.off{background:#3b1515;color:#f87171}.htag.pend{background:#3b2e10;color:#fbbf24}.backup-info{font-size:11px;color:var(--muted);margin-top:4px}
#loginView{min-height:calc(100vh - 52px);display:grid;place-items:center;padding:18px}.login-card{width:min(420px,100%);display:grid;gap:12px}.login-card h2{font-size:24px;color:var(--accent)}.field{display:grid;gap:5px}.field label{font-size:12px;font-weight:800;color:var(--muted)}.field input{width:100%;padding:10px 12px;border-radius:7px;border:1px solid var(--border);background:#0c0f14;color:var(--text);outline:0}.field input:focus{border-color:#3b82f6}.login-error{min-height:20px;color:#f87171;font-size:12px;font-weight:700}.user-pill{display:flex;align-items:center;gap:8px}
</style>
</head>
<body>
<header>
  <h1>Swastik Lab Manager</h1>
  <div class="hbadges" id="headerBadges">
    <span class="badge" id="hNode"><span class="dot grey"></span> checking...</span>
    <span class="badge" id="hIp">IP: -</span>
    <span class="badge" id="hPlatform">-</span>
    <span class="badge" id="hMem">-</span>
  </div>
  <div class="user-pill ${isLoggedIn ? '' : 'hidden'}" id="userPill">
    <span class="badge" id="userBadge">superadmin</span>
    <button class="btn ghost sm" onclick="logout()">Logout</button>
  </div>
</header>

<section id="loginView" class="${isLoggedIn ? 'hidden' : ''}">
  <form class="login-card" onsubmit="login(event)">
    <h2>Super Admin Login</h2>
    <div class="field">
      <label for="username">Username</label>
      <input id="username" name="username" autocomplete="username" required>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
    </div>
    <div class="login-error" id="loginError"></div>
    <button class="btn blue full" type="submit">Login</button>
  </form>
</section>

<main id="dashboardView" class="${isLoggedIn ? '' : 'hidden'}">
  <div class="row g4">
    <div class="card">
      <div class="ctitle">System</div>
      <div class="cbody">
        <div class="srow"><span class="slbl">Node.js</span><span class="sval" id="sNode">-</span></div>
        <div class="srow"><span class="slbl">npm</span><span class="sval" id="sNpm">-</span></div>
        <div class="srow"><span class="slbl">Platform</span><span class="sval" id="sPlatform">-</span></div>
        <div class="srow"><span class="slbl">RAM</span><span class="sval" id="sMem">-</span></div>
        <div class="btn-row">
          <button class="btn ghost sm" onclick="refreshStatus()">Refresh</button>
          <a id="nodeLink" class="btn blue sm" href="https://nodejs.org" target="_blank" style="display:none">Install Node.js</a>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="ctitle">Backend - port ${BACKEND_PORT}</div>
      <div class="cbody">
        <div class="bigst"><span class="dot grey" id="beDot"></span><span class="bigst-txt" id="beStatus">Stopped</span></div>
        <div class="srow"><span class="slbl">Health</span><span class="htag off" id="beHealth">Offline</span></div>
        <div class="srow"><span class="slbl">PID</span><span class="sval" id="beProc">-</span></div>
        <div class="grid-btns">
          <button class="btn green" onclick="post('/api/server/start')">Start</button>
          <button class="btn red" onclick="post('/api/server/stop')">Stop</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="ctitle">Frontend - port ${FRONTEND_PORT}</div>
      <div class="cbody">
        <div class="bigst"><span class="dot grey" id="feDot"></span><span class="bigst-txt" id="feStatus">Stopped</span></div>
        <div class="srow"><span class="slbl">Health</span><span class="htag off" id="feHealth">Offline</span></div>
        <div class="srow"><span class="slbl">PID</span><span class="sval" id="feProc">-</span></div>
        <div class="grid-btns">
          <button class="btn green" onclick="post('/api/client/start')">Start</button>
          <button class="btn red" onclick="post('/api/client/stop')">Stop</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="ctitle">Network</div>
      <div class="cbody">
        <div class="ip-big" id="lanIp">-</div>
        <a class="url-row url-fe" id="feUrl" href="#" onclick="post('/api/browser');return false;">-</a>
        <div class="url-row url-be" id="beUrl">-</div>
        <button class="btn yellow full" style="margin-top:10px" onclick="post('/api/network/restart')">Switch Network & Restart</button>
      </div>
    </div>
  </div>

  <div class="row g2">
    <div class="card">
      <div class="ctitle">Check Node.js & Install Packages</div>
      <div class="grid-btns" style="grid-template-columns:1fr 1fr 1fr 1fr">
        <button class="btn purple" onclick="install('root')">Root</button>
        <button class="btn purple" onclick="install('backend')">Backend</button>
        <button class="btn purple" onclick="install('frontend')">Frontend</button>
        <button class="btn indigo" onclick="install('all')">All</button>
      </div>
    </div>
    <div class="card">
      <div class="ctitle">Quick Actions</div>
      <div class="grid-btns" style="grid-template-columns:repeat(4,1fr)">
        <button class="btn green" onclick="post('/api/both/start')">Start Both</button>
        <button class="btn red" onclick="post('/api/both/stop')">Stop All</button>
        <button class="btn cyan" onclick="post('/api/browser')">Open App</button>
        <button class="btn yellow" onclick="doBackup()">Backup DB</button>
      </div>
      <div class="backup-info" id="backupInfo"></div>
    </div>
  </div>

  <div class="logpanel">
    <div class="loghdr">
      <div class="logtabs">
        <div class="ltab on" onclick="setTab('all',this)">All</div>
        <div class="ltab" onclick="setTab('backend',this)">Backend</div>
        <div class="ltab" onclick="setTab('frontend',this)">Frontend</div>
        <div class="ltab" onclick="setTab('mgr',this)">Manager</div>
        <div class="ltab" onclick="setTab('install',this)">Install</div>
        <div class="ltab" onclick="setTab('backup',this)">Backup</div>
      </div>
      <div class="logacts">
        <button class="btn ghost sm" onclick="toggleAuto()">Auto-scroll: <b id="autoLbl">ON</b></button>
        <button class="btn ghost sm" onclick="clearLog()">Clear</button>
      </div>
    </div>
    <div class="logbody" id="logBody"></div>
  </div>
</main>

<script>
const BPORT = ${BACKEND_PORT};
const FPORT = ${FRONTEND_PORT};
let filter = 'all';
let autoScrl = true;
let stream = null;
const all = [];

function showDashboard(user) {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('dashboardView').classList.remove('hidden');
  document.getElementById('userPill').classList.remove('hidden');
  document.getElementById('userBadge').textContent = (user && user.username ? user.username : 'superadmin') + ' / superadmin';
  connectSSE();
  refreshStatus();
}

function showLogin() {
  document.getElementById('dashboardView').classList.add('hidden');
  document.getElementById('loginView').classList.remove('hidden');
  document.getElementById('userPill').classList.add('hidden');
  if (stream) stream.close();
}

async function login(event) {
  event.preventDefault();
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    errorEl.textContent = data.error || 'Login failed';
    return;
  }
  document.getElementById('password').value = '';
  showDashboard(data.user);
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  showLogin();
}

async function post(url, body = {}) {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.status === 401) return showLogin();
    setTimeout(refreshStatus, 1800);
  } catch(e) { console.warn(e); }
}

function install(target) { post('/api/install', { target }); }
function doBackup() { post('/api/backup'); setTimeout(refreshStatus, 3000); }

const srcMap = { backend:'backend', frontend:'frontend', mgr:'mgr', install:'install', backup:'backup' };
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function addEntry(e) {
  all.push(e);
  if (all.length > 1200) all.shift();
  if (filter !== 'all' && e.source !== filter) return;
  const lb = document.getElementById('logBody');
  const div = document.createElement('div');
  div.className = 'll';
  const t = new Date(e.t).toLocaleTimeString('en-IN', { hour12: false });
  div.innerHTML = '<span class="lt">' + t + '</span>' +
    '<span class="ls ' + (srcMap[e.source] || 'mgr') + '">' + e.source + '</span>' +
    '<span class="lx ' + e.level + '">' + escHtml(e.text) + '</span>';
  lb.appendChild(div);
  if (autoScrl) lb.scrollTop = lb.scrollHeight;
}
function renderAll() {
  const lb = document.getElementById('logBody');
  lb.innerHTML = '';
  const rows = filter === 'all' ? all : all.filter(e => e.source === filter);
  for (const e of rows) addEntry(e);
}
function setTab(f, el) {
  filter = f;
  document.querySelectorAll('.ltab').forEach(tab => tab.classList.remove('on'));
  el.classList.add('on');
  const saved = all.slice();
  all.length = 0;
  document.getElementById('logBody').innerHTML = '';
  for (const e of saved) addEntry(e);
}
function toggleAuto() {
  autoScrl = !autoScrl;
  document.getElementById('autoLbl').textContent = autoScrl ? 'ON' : 'OFF';
}
function clearLog() {
  all.length = 0;
  document.getElementById('logBody').innerHTML = '';
}
function dot(id, cls) {
  const el = document.getElementById(id);
  if (el) el.className = 'dot ' + cls;
}
function htag(id, state) {
  const el = document.getElementById(id);
  if (!el) return;
  if (state === 'ok') { el.className = 'htag ok'; el.textContent = 'OK'; }
  else if (state === 'pend') { el.className = 'htag pend'; el.textContent = 'Starting'; }
  else { el.className = 'htag off'; el.textContent = 'Offline'; }
}
async function refreshStatus() {
  let s;
  try {
    const res = await fetch('/api/status');
    if (res.status === 401) return showLogin();
    s = await res.json();
  } catch { return; }

  if (s.installed) {
    document.getElementById('hNode').innerHTML = '<span class="dot green"></span> ' + s.node;
    document.getElementById('nodeLink').style.display = 'none';
  } else {
    document.getElementById('hNode').innerHTML = '<span class="dot red"></span> Node not found';
    document.getElementById('nodeLink').style.display = 'inline-flex';
  }
  document.getElementById('sNode').textContent = s.node || 'Not installed';
  document.getElementById('sNpm').textContent = s.npm || '-';
  document.getElementById('sPlatform').textContent = s.platform || '-';
  document.getElementById('hPlatform').textContent = s.platform || '-';
  if (s.memory) {
    const mem = s.memory.used + ' / ' + s.memory.total + ' MB';
    document.getElementById('sMem').textContent = mem;
    document.getElementById('hMem').textContent = mem;
  }

  const ip = s.ip || '127.0.0.1';
  document.getElementById('lanIp').textContent = ip;
  document.getElementById('hIp').textContent = 'IP: ' + ip;
  document.getElementById('beUrl').textContent = 'http://' + ip + ':' + BPORT + '/api';
  const feEl = document.getElementById('feUrl');
  feEl.textContent = 'http://' + ip + ':' + FPORT;
  feEl.href = 'http://' + ip + ':' + FPORT;

  const bRun = s.backend.running;
  const bOk = s.backend.health && s.backend.health.ok;
  if (bRun && bOk) { dot('beDot','green'); document.getElementById('beStatus').textContent = 'Running'; }
  else if (bRun) { dot('beDot','yellow'); document.getElementById('beStatus').textContent = 'Starting'; }
  else { dot('beDot','red'); document.getElementById('beStatus').textContent = 'Stopped'; }
  htag('beHealth', bOk ? 'ok' : bRun ? 'pend' : 'off');
  document.getElementById('beProc').textContent = s.backend.pid || '-';

  const fRun = s.frontend.running;
  const fOk = s.frontend.health && s.frontend.health.ok;
  if (fRun && fOk) { dot('feDot','green'); document.getElementById('feStatus').textContent = 'Running'; }
  else if (fRun) { dot('feDot','yellow'); document.getElementById('feStatus').textContent = 'Compiling'; }
  else { dot('feDot','red'); document.getElementById('feStatus').textContent = 'Stopped'; }
  htag('feHealth', fOk ? 'ok' : fRun ? 'pend' : 'off');
  document.getElementById('feProc').textContent = s.frontend.pid || '-';

  if (s.lastBackup) {
    const d = new Date(s.lastBackup.time);
    document.getElementById('backupInfo').textContent = 'Last backup: ' + s.lastBackup.name + ' (' + d.toLocaleString('en-IN') + ')';
  } else {
    document.getElementById('backupInfo').textContent = '';
  }
}
function connectSSE() {
  if (stream) stream.close();
  stream = new EventSource('/api/stream');
  stream.onmessage = ev => { try { addEntry(JSON.parse(ev.data)); } catch {} };
  stream.onerror = () => setTimeout(() => {
    if (!document.getElementById('dashboardView').classList.contains('hidden')) connectSSE();
  }, 3000);
}
(async function init() {
  const res = await fetch('/api/me').catch(() => null);
  const data = res ? await res.json().catch(() => ({})) : {};
  if (data.ok) showDashboard(data.user);
  else showLogin();
  setInterval(() => {
    if (!document.getElementById('dashboardView').classList.contains('hidden')) refreshStatus();
  }, 6000);
})();
</script>
</body>
</html>`;
}

server.listen(MANAGER_PORT, '0.0.0.0', () => {
  const ip = getLanIp();
  lastLanIp = ip;
  console.log('');
  console.log('==============================================');
  console.log(' Swastik Gold & Silver Lab - Manager');
  console.log('==============================================');
  console.log(` Dashboard : http://${ip}:${MANAGER_PORT}`);
  console.log(` Local     : http://localhost:${MANAGER_PORT}`);
  console.log('');
  openBrowser(`http://${ip}:${MANAGER_PORT}`);
  pushLog('mgr', `Manager online - http://${ip}:${MANAGER_PORT}`, 'success');
  pushLog('mgr', `Auth DB: ${DB_PATH}`);
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${MANAGER_PORT} is already in use.`);
    console.error(`Try http://localhost:${MANAGER_PORT}`);
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});

setInterval(monitorNetwork, 10000);

process.on('SIGINT', () => {
  stopBackend();
  stopFrontend();
  process.exit(0);
});
