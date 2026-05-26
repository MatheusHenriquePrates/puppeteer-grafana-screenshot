# puppeteer-grafana-screenshot

Headless Chromium screenshot tool for Grafana dashboards. Logs in, navigates
to a dashboard in kiosk mode, waits for the panels to render, saves a PNG.
Includes a defensive 60-second hard-kill timer so it never leaves Chromium
hanging on your server.

- Single Node.js file, single dep (`puppeteer-core`)
- Config via env vars **or** CLI flags
- Tuned for cron — short timeouts, hard kill, clear exit codes

## Why a separate tool?

Grafana ships its own [image renderer plugin](https://grafana.com/grafana/plugins/grafana-image-renderer/),
which is great if you can install plugins on the Grafana server. If you
can't (read-only instance, hosted, shared with a team) — drive a browser
from outside instead. This script is ~120 lines and uses the `chromium`
binary already on most Linux servers.

## Install

```bash
# 1. Chromium (most distros)
sudo apt-get install -y chromium

# 2. puppeteer-core
mkdir -p /opt/grafana-screenshot && cd /opt/grafana-screenshot
npm init -y && npm install puppeteer-core
cp /path/to/screenshot-grafana.js .

# 3. .env (or pass everything via CLI)
cat > .env <<EOF
GRAFANA_URL=https://grafana.example.com
GRAFANA_USER=alice
GRAFANA_PASSWORD=super-secret
DASHBOARD_PATH=/d/abc123/my-dashboard
OUTPUT_PATH=/tmp/grafana-dashboard.png
EOF

# 4. Run
set -a && . ./.env && set +a
node screenshot-grafana.js
```

## Usage

### Env vars

```bash
GRAFANA_URL=https://grafana.example.com \
GRAFANA_USER=alice \
GRAFANA_PASSWORD=secret \
DASHBOARD_PATH=/d/abc123/my-dashboard \
node screenshot-grafana.js
```

### CLI flags

```bash
node screenshot-grafana.js \
  --url https://grafana.example.com \
  --user alice \
  --password secret \
  --dashboard /d/abc123/my-dashboard \
  --out /tmp/dashboard.png
```

### Cron (every 5 minutes)

```cron
*/5 * * * * cd /opt/grafana-screenshot && set -a && . ./.env && set +a && /usr/bin/node screenshot-grafana.js >> /var/log/grafana-screenshot.log 2>&1
```

## Configuration

### Required

| Variable | CLI flag | Description |
|---|---|---|
| `GRAFANA_URL` | `--url` | Grafana base URL, e.g. `https://grafana.example.com` |
| `GRAFANA_USER` | `--user` | Login username |
| `GRAFANA_PASSWORD` | `--password` | Login password |
| `DASHBOARD_PATH` | `--dashboard` | Dashboard path, e.g. `/d/abc123/my-dashboard` (without `?kiosk`) |

### Optional

| Variable | CLI flag | Default | Description |
|---|---|---|---|
| `OUTPUT_PATH` | `--out` | `/tmp/grafana-dashboard.png` | PNG output path |
| `VIEWPORT_WIDTH` | `--width` | `1920` | Browser viewport width |
| `VIEWPORT_HEIGHT` | `--height` | `1080` | Browser viewport height |
| `RENDER_WAIT_MS` | — | `15000` | Wait after navigation for panels to render |
| `HARD_KILL_MS` | — | `60000` | Force-exit timer (zombie protection) |
| `CHROMIUM_PATH` | — | `/usr/bin/chromium` | Path to the Chromium binary |

## Notes

- Stores **credentials in plain env vars**. Never bake them into the script
  or commit your `.env`. Use a secret manager if your environment supports
  one.
- The login flow is the standard Grafana basic form (`input[name="user"]` +
  `input[name="password"]`). If your Grafana is behind SSO/OAuth this script
  won't work without changes.
- Kiosk mode is appended as `?kiosk` (or `&kiosk` if the URL already has a
  query string) so panel chrome is hidden in the PNG.

## License

MIT — see [LICENSE](LICENSE).
