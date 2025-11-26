# 🚀 Quick Start - Web-App

## Dev-Server starten:

### Option 1: Start-Skript (Einfachste)
```bash
./start_server.sh
```

### Option 2: Python direkt
```bash
cd /Users/noelguyaz/Projekte/Rechnung-NG72
python3 -m http.server 8000
```

## App öffnen:

**Öffnen Sie in Ihrem Browser:**
```
http://localhost:8000
```

## ✅ Behobene Probleme:

1. ✅ **Doppelte `iban` Variable** - behoben
2. ✅ **QRCode Bibliothek** - korrigierte URL
3. ✅ **IBAN-Speicherung** - funktioniert jetzt
4. ✅ **Event Listener** - korrekt initialisiert

## 🧪 Testen Sie jetzt:

1. **Öffnen Sie:** http://localhost:8000
2. **IBAN eingeben:** Geben Sie Ihre IBAN ein → "IBAN speichern"
3. **Kunde hinzufügen:** Name, Adresse, PLZ Ort → "Kunde speichern"
4. **Artikel hinzufügen:** Bezeichnung und Preis → "Artikel speichern"
5. **Empfänger auswählen:** Wählen Sie einen Kunden aus dem Dropdown
6. **Position hinzufügen:** Artikel wählen, Menge eingeben → "+ Position"
7. **PDF erstellen:** "PDF erstellen & herunterladen" klicken

## 🎯 Alles sollte jetzt funktionieren!

Die Web-App ist vollständig funktionsfähig mit QR-Rechnung nach Schweizer Standard! 🎉

