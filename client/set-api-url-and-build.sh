#!/bin/bash
# Ermittelt die öffentliche IP und setzt sie als VITE_API_URL für das Frontend, dann wird gebaut

# Öffentliche IP ermitteln
PUBLIC_IP=$(curl -s https://api.ipify.org)

if [ -z "$PUBLIC_IP" ]; then
  echo "Konnte öffentliche IP nicht ermitteln!"
  exit 1
fi

# .env im client-Verzeichnis setzen
cat > .env <<EOF
VITE_API_URL=http://$PUBLIC_IP:3001/api
EOF

echo ".env mit VITE_API_URL=http://$PUBLIC_IP:3001/api wurde erstellt."

echo "Starte Build..."
npm install && npm run build

echo "Fertig! Das Frontend ist jetzt für die öffentliche API erreichbar."
