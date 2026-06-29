#!/bin/bash
cd "$(dirname "$0")"
echo "Iniciando servidor..."
open "http://localhost:8080/UASD%20Fingerprint%20System.html"
python3 -m http.server 8080
