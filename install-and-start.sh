#!/bin/bash
# Komplett-Setup- und Startskript für Paint.IT (Ubuntu/Linux)
# 1. Öffentliche IP ermitteln
# 2. Abhängigkeiten installieren (global)
# 3. Frontend & Backend installieren
# 4. Frontend & Backend starten

set -e

# 1. Öffentliche IP ermitteln
PUBLIC_IP=$(curl -s https://api.ipify.org)
if [ -z "$PUBLIC_IP" ]; then
  echo "Konnte öffentliche IP nicht ermitteln!"
  exit 1
fi

echo "[1/4] Öffentliche IP: $PUBLIC_IP"

# 2. Node.js & npm prüfen
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js nicht gefunden! Bitte vorher Node.js 18+ installieren."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "npm nicht gefunden! Bitte vorher Node.js 18+ installieren."
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 nicht gefunden. Installiere pm2 global..."
  # Je nach Systemkonfiguration ist hier 'sudo' erforderlich
  npm install -g pm2
fi


echo "[2/4] Installiere Backend-Abhängigkeiten..."
cd server
npm install
cd ..

echo "[3/4] Setze Frontend-API-URL und installiere Abhängigkeiten..."
cd client
cat > .env <<EOF
VITE_API_URL=http://$PUBLIC_IP:3001/api
EOF
npm install
npm run build
cd ..

echo "[4/4] Starte Backend (Port 3001) und Frontend (Port 5173) mit pm2..."
# Stoppe eventuell bereits laufende Prozesse mit demselben Namen
pm2 delete paintit-backend || true
pm2 delete paintit-frontend || true

pm2 start npm --name "paintit-backend" -- run start --cwd ./server
pm2 start npm --name "paintit-frontend" -- run preview --cwd ./client

echo "Speichere die Prozessliste, damit sie nach einem Server-Neustart wiederhergestellt werden kann..."
pm2 save

echo "Fertig! Paint.IT wird von pm2 verwaltet."
echo "  Backend:  http://$PUBLIC_IP:3001"
echo "  Frontend: http://$PUBLIC_IP:5173"
echo ""
echo "Verwende 'pm2 list' um den Status zu sehen oder 'pm2 logs' für die Logs."
echo "TIPP: Führe 'pm2 startup' aus und folge den Anweisungen, um die Apps bei einem Server-Reboot automatisch zu starten."
