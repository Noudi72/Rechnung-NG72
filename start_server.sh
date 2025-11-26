#!/bin/bash
# Dev-Server für Rechnung NG72 Web-App starten

cd "$(dirname "$0")"
echo "🚀 Starte Dev-Server auf http://localhost:8000"
echo "📱 Öffnen Sie http://localhost:8000 in Ihrem Browser"
echo "⏹️  Drücken Sie Ctrl+C zum Beenden"
echo ""
python3 -m http.server 8000

