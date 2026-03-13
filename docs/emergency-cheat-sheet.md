# 🚑 SwastikCore V1.0: Emergency Cheat Sheet

### 🟢 1. The Panic Buttons (PM2 Commands)

If the system feels slow, the XRF isn't connecting, or the front desk complains the website won't load, open the **Administrator PowerShell** on the server and use these commands:

* **See what is running:** `pm2 status`
*(Look for green "online" statuses for both frontend and backend).*
* **The "Turn it off and on again" button:** `pm2 restart all`
*(This takes 2 seconds and safely reboots the entire lab without losing data).*
* **Watch the live matrix (Logs):** `pm2 logs`
*(Press `Ctrl+C` to exit the log view).*

### 🌐 2. Local Network URLs

If a front-desk computer gets disconnected, tell the technician to type this into their Chrome browser:

* **The Main Dashboard:** `http://localhost:3000` *(If on the server itself)* or `http://<SERVER_IP_ADDRESS>:3000` *(If on a different lab computer)*.
* **Customer Verification Portal:** `http://localhost:3000/verify/`

### 📁 3. Critical File Locations

If you ever need to manually verify files on the Windows server:

* **The Live Database:** `C:\Users\pc\OneDrive\Desktop\Utility\swastik-gold-silver-lab\backend\db\lab.db`
* **The Old Archived DBs:** `C:\Users\pc\OneDrive\Desktop\Utility\swastik-gold-silver-lab\backend\db\` *(Look for `archive_2026.db`)*
* **Raw Application Logs:** `C:\Users\pc\OneDrive\Desktop\Utility\swastik-gold-silver-lab\logs\`

### 💾 4. How to Force a Manual Backup

The system automatically backs up to AWS S3 every night. However, if you are about to do something massive and want immediate peace of mind:

1. Open PowerShell and navigate to the backend folder: `cd C:\Users\pc\OneDrive\Desktop\Utility\swastik-gold-silver-lab\backend`
2. Run the backup script: `node scripts/backup.js`
3. Check your AWS S3 bucket to confirm the fresh `.zip` file arrived.
