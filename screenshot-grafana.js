#!/usr/bin/env node
/*
 * puppeteer-grafana-screenshot — headless Chromium capture of a Grafana dashboard
 *
 * Logs into a Grafana instance, navigates to a dashboard in kiosk mode,
 * waits for the panels to render, and saves a PNG at the chosen viewport.
 *
 * All settings are read from env vars or CLI flags. A defensive 60s kill
 * timer guarantees the process exits even if Chromium hangs.
 *
 * Required:
 *   GRAFANA_URL        e.g. https://grafana.example.com
 *   GRAFANA_USER       Grafana login
 *   GRAFANA_PASSWORD   Grafana password
 *   DASHBOARD_PATH     e.g. /d/abc123/my-dashboard      (without ?kiosk)
 *
 * Optional:
 *   OUTPUT_PATH        default: /tmp/grafana-dashboard.png
 *   VIEWPORT_WIDTH     default: 1920
 *   VIEWPORT_HEIGHT    default: 1080
 *   RENDER_WAIT_MS     default: 15000   (time to wait for panels to load)
 *   HARD_KILL_MS       default: 60000   (force exit after this)
 *   CHROMIUM_PATH      default: /usr/bin/chromium
 *
 * CLI usage:
 *   node screenshot-grafana.js --url https://grafana.example.com \
 *        --user admin --password 'xxx' \
 *        --dashboard /d/abc/my-dashboard \
 *        --out /tmp/dashboard.png
 *
 * Example cron (Linux):
 *   */5 * * * *  /usr/bin/node /opt/screenshot-grafana.js
 */

const puppeteer = require('puppeteer-core');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      out[key] = argv[i + 1];
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv);

const GRAFANA_URL      = args.url        || process.env.GRAFANA_URL;
const GRAFANA_USER     = args.user       || process.env.GRAFANA_USER;
const GRAFANA_PASSWORD = args.password   || process.env.GRAFANA_PASSWORD;
const DASHBOARD_PATH   = args.dashboard  || process.env.DASHBOARD_PATH;
const OUTPUT_PATH      = args.out        || process.env.OUTPUT_PATH    || '/tmp/grafana-dashboard.png';
const VIEWPORT_WIDTH   = parseInt(args.width  || process.env.VIEWPORT_WIDTH  || '1920', 10);
const VIEWPORT_HEIGHT  = parseInt(args.height || process.env.VIEWPORT_HEIGHT || '1080', 10);
const RENDER_WAIT_MS   = parseInt(process.env.RENDER_WAIT_MS || '15000', 10);
const HARD_KILL_MS     = parseInt(process.env.HARD_KILL_MS   || '60000', 10);
const CHROMIUM_PATH    = process.env.CHROMIUM_PATH || '/usr/bin/chromium';

function fatal(msg) {
  console.error(`error: ${msg}`);
  console.error('Run with --help or check the header of this file for usage.');
  process.exit(1);
}

if (args.help || args.h) {
  // Print the top-of-file comment block as help
  console.log('See https://github.com/MatheusHenriquePrates/puppeteer-grafana-screenshot for full docs.');
  console.log('Required env: GRAFANA_URL, GRAFANA_USER, GRAFANA_PASSWORD, DASHBOARD_PATH');
  process.exit(0);
}
if (!GRAFANA_URL)      fatal('GRAFANA_URL is required');
if (!GRAFANA_USER)     fatal('GRAFANA_USER is required');
if (!GRAFANA_PASSWORD) fatal('GRAFANA_PASSWORD is required');
if (!DASHBOARD_PATH)   fatal('DASHBOARD_PATH is required (e.g. /d/abc123/my-dashboard)');

(async () => {
  let browser;

  // Hard kill — guarantees exit even if Chromium hangs
  const killTimer = setTimeout(() => {
    console.error('Hard timeout reached, killing process');
    if (browser) browser.close().catch(() => {});
    process.exit(1);
  }, HARD_KILL_MS);

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: CHROMIUM_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      timeout: 15000,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

    // Login
    console.log(`Opening ${GRAFANA_URL}/login ...`);
    await page.goto(`${GRAFANA_URL.replace(/\/$/, '')}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    await page.type('input[name="user"]', GRAFANA_USER);
    await page.type('input[name="password"]', GRAFANA_PASSWORD);
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Dashboard in kiosk mode
    const kioskUrl = `${GRAFANA_URL.replace(/\/$/, '')}${DASHBOARD_PATH}${DASHBOARD_PATH.includes('?') ? '&' : '?'}kiosk`;
    console.log(`Opening dashboard ${kioskUrl} ...`);
    await page.goto(kioskUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    console.log(`Waiting ${RENDER_WAIT_MS}ms for panels to render ...`);
    await new Promise((r) => setTimeout(r, RENDER_WAIT_MS));

    await page.evaluate(() => window.scrollTo(0, 100));
    await page.screenshot({ path: OUTPUT_PATH });

    console.log(`Saved screenshot: ${OUTPUT_PATH}`);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  } finally {
    clearTimeout(killTimer);
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    process.exit(process.exitCode || 0);
  }
})();
