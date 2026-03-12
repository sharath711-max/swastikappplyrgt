const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : 2,
    timeout: 60000,
    expect: {
        timeout: 10000,
    },
    reporter: [['html', { open: 'never' }]],
    use: {
        baseURL: 'http://127.0.0.1:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        launchOptions: {
            slowMo: Number(process.env.E2E_SLOWMO || 150),
        },
    },
    webServer: [
        {
            command: 'npm --prefix ../backend start',
            url: 'http://127.0.0.1:5000/health',
            timeout: 120000,
            reuseExistingServer: true,
            env: {
                ...process.env,
                PORT: '5000',
                NODE_ENV: 'test',
            },
        },
        {
            command: 'npm start',
            url: 'http://127.0.0.1:3000/login',
            timeout: 180000,
            reuseExistingServer: true,
            env: {
                ...process.env,
                BROWSER: 'none',
                CI: 'true',
                PORT: '3000',
                REACT_APP_API_URL: 'http://127.0.0.1:5000/api',
            },
        },
    ],

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
