<p align="center">
  <a href="#-portugu%C3%AAs"><img src="https://img.shields.io/badge/-PT--BR-39d353?style=for-the-badge&labelColor=0d1117" alt="PT-BR"/></a>
  &nbsp;
  <a href="#-english"><img src="https://img.shields.io/badge/-EN-58a6ff?style=for-the-badge&labelColor=0d1117" alt="EN"/></a>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=slice&color=0:0d1117,100:39d353&height=180&section=header&text=puppeteer-grafana-screenshot&fontSize=28&fontColor=ffffff&animation=fadeIn&fontAlignY=42&desc=screenshot%20de%20dashboard%20Grafana%20via%20Chromium%20headless&descAlignY=68&descSize=14" width="100%" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com/?lines=%24+matheus%40devops%3A~%24+puppeteer-grafana-screenshot;%24+login%2C+kiosk%2C+render%2C+PNG%2C+sai;%24+hard-kill+de+60s+pra+n%C3%A3o+deixar+zumbi;%24+arquivo+%C3%BAnico+de+Node%2C+puppeteer-core&font=Fira%20Code&size=18&pause=1200&color=39D353&center=true&vCenter=true&width=720&height=45" />
</p>

<a id="-português"></a>

## PT-BR

```bash
matheus@devops:~$ cat sobre.txt
```

Ferramenta de screenshot via Chromium headless pra dashboard Grafana. Loga, navega pro dashboard em modo kiosk, espera os painéis renderizarem, salva um PNG. Inclui um hard-kill timer defensivo de 60 segundos pra nunca deixar o Chromium pendurado no seu servidor.

- Arquivo único de Node.js, dep única (`puppeteer-core`)
- Config via env vars **ou** flags de CLI
- Tunado pra cron — timeout curto, hard kill, exit codes claros

```bash
matheus@devops:~$ ls stack/
```

![Node.js](https://img.shields.io/badge/-Node.js-0d1117?style=for-the-badge&logo=node.js&logoColor=39d353) ![Puppeteer](https://img.shields.io/badge/-Puppeteer-0d1117?style=for-the-badge&logo=puppeteer&logoColor=39d353) ![Grafana](https://img.shields.io/badge/-Grafana-0d1117?style=for-the-badge&logo=grafana&logoColor=39d353) ![Chromium](https://img.shields.io/badge/-Chromium-0d1117?style=for-the-badge&logo=googlechrome&logoColor=39d353) ![cron](https://img.shields.io/badge/-cron-0d1117?style=for-the-badge&logo=linux&logoColor=39d353)

```bash
matheus@devops:~$ cat por-que-existe.txt
```

O Grafana tem o próprio [image renderer plugin](https://grafana.com/grafana/plugins/grafana-image-renderer/), o que é ótimo se você consegue instalar plugin no servidor Grafana. Se não consegue (instance read-only, hosted, compartilhado com time) — dirige um browser de fora. Esse script tem ~120 linhas e usa o binário `chromium` que já tá na maioria dos servidores Linux.

```bash
matheus@devops:~$ ./install.sh
```

```bash
# 1. Chromium (maioria das distros)
sudo apt-get install -y chromium

# 2. puppeteer-core
mkdir -p /opt/grafana-screenshot && cd /opt/grafana-screenshot
npm init -y && npm install puppeteer-core
cp /path/to/screenshot-grafana.js .

# 3. .env (ou passa tudo via CLI)
cat > .env <<EOF
GRAFANA_URL=https://grafana.example.com
GRAFANA_USER=alice
GRAFANA_PASSWORD=super-secret
DASHBOARD_PATH=/d/abc123/my-dashboard
OUTPUT_PATH=/tmp/grafana-dashboard.png
EOF

# 4. Roda
set -a && . ./.env && set +a
node screenshot-grafana.js
```

```bash
matheus@devops:~$ ./run.sh
```

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

### Cron (a cada 5 minutos)

```cron
*/5 * * * * cd /opt/grafana-screenshot && set -a && . ./.env && set +a && /usr/bin/node screenshot-grafana.js >> /var/log/grafana-screenshot.log 2>&1
```

```bash
matheus@devops:~$ cat config.env
```

### Obrigatórias

| Variável | Flag CLI | Descrição |
|---|---|---|
| `GRAFANA_URL` | `--url` | URL base do Grafana, ex.: `https://grafana.example.com` |
| `GRAFANA_USER` | `--user` | Usuário de login |
| `GRAFANA_PASSWORD` | `--password` | Senha de login |
| `DASHBOARD_PATH` | `--dashboard` | Path do dashboard, ex.: `/d/abc123/my-dashboard` (sem `?kiosk`) |

### Opcionais

| Variável | Flag CLI | Default | Descrição |
|---|---|---|---|
| `OUTPUT_PATH` | `--out` | `/tmp/grafana-dashboard.png` | Caminho de saída do PNG |
| `VIEWPORT_WIDTH` | `--width` | `1920` | Largura do viewport |
| `VIEWPORT_HEIGHT` | `--height` | `1080` | Altura do viewport |
| `RENDER_WAIT_MS` | — | `15000` | Espera após a navegação pros painéis renderizarem |
| `HARD_KILL_MS` | — | `60000` | Timer de force-exit (proteção contra zumbi) |
| `CHROMIUM_PATH` | — | `/usr/bin/chromium` | Caminho do binário do Chromium |

```bash
matheus@devops:~$ cat notas.txt
```

- Guarda **credenciais em env var plain**. Nunca coloca elas no script nem comita seu `.env`. Usa secret manager se o ambiente suporta.
- O login flow é o form básico padrão do Grafana (`input[name="user"]` + `input[name="password"]`). Se seu Grafana fica atrás de SSO/OAuth, esse script não funciona sem mudanças.
- O modo kiosk é appendado como `?kiosk` (ou `&kiosk` se a URL já tem query string), então o chrome dos painéis fica escondido no PNG.

```bash
matheus@devops:~$ cat LICENSE
```

MIT — veja [LICENSE](LICENSE).

```bash
matheus@devops:~$ contact
```

[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0d1117?style=for-the-badge&logo=linkedin&logoColor=39d353)](https://www.linkedin.com/in/matheus-henrique-prates-586328234/)
[![Email](https://img.shields.io/badge/-Email-0d1117?style=for-the-badge&logo=gmail&logoColor=39d353)](mailto:mathues12398henrique@gmail.com)

```bash
matheus@devops:~$ _
```

---

<a id="-english"></a>

## EN

```bash
matheus@devops:~$ cat about.txt
```

Headless Chromium screenshot tool for Grafana dashboards. Logs in, navigates to a dashboard in kiosk mode, waits for the panels to render, saves a PNG. Includes a defensive 60-second hard-kill timer so it never leaves Chromium hanging on your server.

- Single Node.js file, single dep (`puppeteer-core`)
- Config via env vars **or** CLI flags
- Tuned for cron — short timeouts, hard kill, clear exit codes

```bash
matheus@devops:~$ ls stack/
```

![Node.js](https://img.shields.io/badge/-Node.js-0d1117?style=for-the-badge&logo=node.js&logoColor=39d353) ![Puppeteer](https://img.shields.io/badge/-Puppeteer-0d1117?style=for-the-badge&logo=puppeteer&logoColor=39d353) ![Grafana](https://img.shields.io/badge/-Grafana-0d1117?style=for-the-badge&logo=grafana&logoColor=39d353) ![Chromium](https://img.shields.io/badge/-Chromium-0d1117?style=for-the-badge&logo=googlechrome&logoColor=39d353) ![cron](https://img.shields.io/badge/-cron-0d1117?style=for-the-badge&logo=linux&logoColor=39d353)

```bash
matheus@devops:~$ cat why-a-separate-tool.txt
```

Grafana ships its own [image renderer plugin](https://grafana.com/grafana/plugins/grafana-image-renderer/), which is great if you can install plugins on the Grafana server. If you can't (read-only instance, hosted, shared with a team) — drive a browser from outside instead. This script is ~120 lines and uses the `chromium` binary already on most Linux servers.

```bash
matheus@devops:~$ ./install.sh
```

```bash
sudo apt-get install -y chromium

mkdir -p /opt/grafana-screenshot && cd /opt/grafana-screenshot
npm init -y && npm install puppeteer-core
cp /path/to/screenshot-grafana.js .

cat > .env <<EOF
GRAFANA_URL=https://grafana.example.com
GRAFANA_USER=alice
GRAFANA_PASSWORD=super-secret
DASHBOARD_PATH=/d/abc123/my-dashboard
OUTPUT_PATH=/tmp/grafana-dashboard.png
EOF

set -a && . ./.env && set +a
node screenshot-grafana.js
```

```bash
matheus@devops:~$ ./run.sh
```

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

```bash
matheus@devops:~$ cat config.env
```

### Required

| Variable | CLI flag | Description |
|---|---|---|
| `GRAFANA_URL` | `--url` | Grafana base URL |
| `GRAFANA_USER` | `--user` | Login username |
| `GRAFANA_PASSWORD` | `--password` | Login password |
| `DASHBOARD_PATH` | `--dashboard` | Dashboard path (without `?kiosk`) |

### Optional

| Variable | CLI flag | Default | Description |
|---|---|---|---|
| `OUTPUT_PATH` | `--out` | `/tmp/grafana-dashboard.png` | PNG output path |
| `VIEWPORT_WIDTH` | `--width` | `1920` | Browser viewport width |
| `VIEWPORT_HEIGHT` | `--height` | `1080` | Browser viewport height |
| `RENDER_WAIT_MS` | — | `15000` | Wait after navigation for panels to render |
| `HARD_KILL_MS` | — | `60000` | Force-exit timer (zombie protection) |
| `CHROMIUM_PATH` | — | `/usr/bin/chromium` | Path to the Chromium binary |

```bash
matheus@devops:~$ cat notes.txt
```

- Stores **credentials in plain env vars**. Never bake them into the script or commit your `.env`. Use a secret manager if your environment supports one.
- The login flow is the standard Grafana basic form (`input[name="user"]` + `input[name="password"]`). If your Grafana is behind SSO/OAuth this script won't work without changes.
- Kiosk mode is appended as `?kiosk` (or `&kiosk` if the URL already has a query string) so panel chrome is hidden in the PNG.

```bash
matheus@devops:~$ cat LICENSE
```

MIT — see [LICENSE](LICENSE).

```bash
matheus@devops:~$ contact
```

[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0d1117?style=for-the-badge&logo=linkedin&logoColor=39d353)](https://www.linkedin.com/in/matheus-henrique-prates-586328234/) [![Email](https://img.shields.io/badge/-Email-0d1117?style=for-the-badge&logo=gmail&logoColor=39d353)](mailto:mathues12398henrique@gmail.com)

```bash
matheus@devops:~$ _
```

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:39d353,100:0d1117&height=120&section=footer" width="100%" />
</p>
