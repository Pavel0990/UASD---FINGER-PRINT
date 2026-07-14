---
name: run-uasd-fingerprint
description: Run, launch, screenshot, or interact with the UASD Fingerprint biometric attendance system. Use when asked to start the app, take a screenshot, verify a UI change, or test a view.
---

# UASD Fingerprint System — Run Skill

Static in-browser React app (JSX + Babel, no build step). Served via Python's built-in HTTP server and driven headlessly with Brave Browser's `--headless=new` mode.

## Prerequisites

- Python 3 (pre-installed on macOS)
- Brave Browser at `/Applications/Brave Browser.app` (confirmed present)
- No npm, no build step, no Node required

## Start the server

```bash
cd "/Users/pavelabreu/Desktop/UASD - FINGERPRINT"
python3 -m http.server 8080 &
```

Verify it's up:

```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/UASD%20Fingerprint%20System.html"
# → 200
```

## Run (agent path) — headless screenshot

```bash
BRAVE="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
"$BRAVE" \
  --headless=new \
  --disable-gpu \
  --screenshot="screenshots/verify.png" \
  --window-size=1440,900 \
  --virtual-time-budget=4000 \
  "http://localhost:8080/UASD%20Fingerprint%20System.html"
```

Screenshot lands at `screenshots/verify.png` relative to the project root.
Read it with the `Read` tool to visually inspect the result.

## Run (human path)

```bash
cd "/Users/pavelabreu/Desktop/UASD - FINGERPRINT"
bash "Abrir sistema.command"
```

Opens `http://localhost:8080/UASD%20Fingerprint%20System.html` in the default browser and starts the server. Press Ctrl-C to stop.

## Cache busting

JSX files are loaded with `?v=N` query strings in `UASD Fingerprint System.html` (line ~54).
After editing any `.jsx` file, bump the version number so the browser loads the new code:

```bash
grep "vacaciones.jsx" "/Users/pavelabreu/Desktop/UASD - FINGERPRINT/UASD Fingerprint System.html"
# Change ?v=36 → ?v=37, etc.
```

## Routes / views

The app uses an internal router in `app.jsx`. Views are:

| Route key | File | Description |
|---|---|---|
| `kiosk` | kiosk.jsx | Biometric terminal (default) |
| `login` | login.jsx | Login screen |
| `dashboard` | dashboard.jsx | Employee dashboard |
| `register` | register.jsx | Employee registration |
| `reports` | reports.jsx | Attendance reports |
| `changelog` | changelog.jsx | Activity log |
| `roles` | roles.jsx | Role management |
| `finca` | finca.jsx | Finca Experimental attendance |
| `liceo` | liceo.jsx | Liceo Experimental attendance |
| `vacaciones` | vacaciones.jsx | Collective vacation management |

localStorage (`uasd_*` keys) holds all app state — employees, attendance, roles, vacation periods.

## Gotchas

- **`localhost` only, not `127.0.0.1`** — the app auto-redirects `127.0.0.1` → `localhost` (WebAuthn requirement). Always use `localhost:8080`.
- **`--virtual-time-budget`** must be ≥ 3000ms for Babel to finish transpiling all JSX before the screenshot is taken. 4000ms is safe.
- **`--disable-gpu` is required** on headless runs; without it Brave may hang.
- **No build step** — edits to `.jsx` or `.css` files are live immediately after a browser reload. No compilation needed.
- **`chromium-cli` is not installed** on this machine. Use Brave's built-in `--headless=new` mode instead (confirmed working as of 2026-07-14).
