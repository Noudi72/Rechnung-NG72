# Progressive Web App (PWA) Setup

Diese Web-App ist jetzt als Progressive Web App (PWA) konfiguriert und kann als App installiert werden.

## Was wurde hinzugefügt:

1. **manifest.json** - Definiert die App-Metadaten, Icons und Display-Modi
2. **sw.js** - Service Worker für Offline-Funktionalität und Caching
3. **Icons** - icon-192.png und icon-512.png für verschiedene Geräte
4. **Meta-Tags** - In index.html für PWA-Unterstützung

## Installation als App:

### Chrome/Edge (Desktop):
1. Öffnen Sie die Web-App im Browser
2. Klicken Sie auf das Install-Icon in der Adressleiste (oder Menü → "App installieren")
3. Die App wird installiert und kann wie eine native App gestartet werden

### Chrome (Android):
1. Öffnen Sie die Web-App im Chrome Browser
2. Tippen Sie auf das Menü (3 Punkte)
3. Wählen Sie "Zum Startbildschirm hinzufügen" oder "Installieren"
4. Die App erscheint auf dem Startbildschirm

### Safari (iOS):
1. Öffnen Sie die Web-App im Safari Browser
2. Tippen Sie auf das Teilen-Icon
3. Wählen Sie "Zum Home-Bildschirm"
4. Die App wird als Icon hinzugefügt

## Features:

- ✅ **Offline-Funktionalität**: Die App funktioniert auch ohne Internetverbindung
- ✅ **App-ähnliches Verhalten**: Startet ohne Browser-UI
- ✅ **Caching**: Wichtige Dateien werden gecacht für schnelleres Laden
- ✅ **Installierbar**: Kann auf dem Startbildschirm/Desktop installiert werden

## Wichtig für Production:

Für eine vollständige PWA-Funktionalität benötigen Sie:
- **HTTPS**: Service Worker funktionieren nur über HTTPS (oder localhost)
- **Valid Manifest**: Der manifest.json muss korrekt sein (✓ erledigt)
- **Service Worker**: Muss registriert sein (✓ erledigt)
- **Icons**: Mindestens 192x192 und 512x512 (✓ erledigt)

## Testing:

1. Öffnen Sie die App im Browser
2. Öffnen Sie die Developer Tools (F12)
3. Gehen Sie zu "Application" → "Service Workers"
4. Prüfen Sie, ob der Service Worker registriert ist
5. Gehen Sie zu "Application" → "Manifest"
6. Prüfen Sie, ob das Manifest korrekt geladen wird

## Troubleshooting:

- **Service Worker nicht aktiv**: Prüfen Sie die Browser-Konsole auf Fehler
- **App nicht installierbar**: Stellen Sie sicher, dass HTTPS verwendet wird (oder localhost)
- **Icons nicht sichtbar**: Prüfen Sie, ob icon-192.png und icon-512.png existieren

