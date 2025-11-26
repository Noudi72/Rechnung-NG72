# Dev-Server für Web-App

## ✅ Dev-Server läuft!

Der Server wurde gestartet und läuft im Hintergrund.

## 🌐 App öffnen:

**Öffnen Sie in Ihrem Browser:**
```
http://localhost:8000
```

Oder klicken Sie hier: [http://localhost:8000](http://localhost:8000)

## 🔧 Server manuell starten:

### Option 1: Python (bereits gestartet)
```bash
cd /Users/noelguyaz/Projekte/Rechnung-NG72
python3 -m http.server 8000
```

### Option 2: Start-Skript
```bash
./start_server.sh
```

### Option 3: Node.js (falls installiert)
```bash
npx http-server -p 8000
```

## 🛑 Server stoppen:

Im Terminal wo der Server läuft:
- **Ctrl+C** drücken

## ✅ Behobene Fehler:

1. **Doppelte `iban` Variable** - behoben
2. **QRCode Bibliothek URL** - korrigiert
3. **IBAN-Speicherung** - funktioniert jetzt korrekt

## 🧪 Testen:

1. Öffnen Sie http://localhost:8000
2. Geben Sie eine IBAN ein → "IBAN speichern" klicken
3. Kunde hinzufügen → sollte funktionieren
4. Artikel hinzufügen → sollte funktionieren
5. Empfänger auswählen → sollte funktionieren
6. PDF erstellen → sollte funktionieren

Die App sollte jetzt vollständig funktionieren! 🎉

