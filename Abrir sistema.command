#!/bin/bash
cd "$(dirname "$0")"
echo "Iniciando servidor..."

if [ ! -d "backend/node_modules" ]; then
  echo "Instalando dependencias del backend (primera vez)..."
  (cd backend && npm install)
fi

open "http://localhost:8080/UASD%20Fingerprint%20System.html"
(cd backend && npm start)
