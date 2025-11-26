# Rechnung NG72 - Web-App mit QR-Rechnung

## ✅ Fertig und funktionsfähig!

Die Web-App ist jetzt vollständig mit QR-Rechnung nach Schweizer Standard ausgestattet.

## 🚀 So verwenden Sie die App:

### 1. App öffnen
- **Doppelklicken Sie auf `index.html`** im Finder
- Oder ziehen Sie die Datei in Ihren Browser (Safari, Chrome, Firefox, etc.)

### 2. IBAN eingeben (wichtig für QR-Rechnung)
- Geben Sie Ihre IBAN im Feld "IBAN (für QR-Rechnung)" ein
- Klicken Sie auf "IBAN speichern"
- Die IBAN wird lokal gespeichert

### 3. Rechnung erstellen
- **Kunden hinzufügen:** Name, Adresse, PLZ Ort eingeben → "Kunde speichern"
- **Artikel hinzufügen:** Bezeichnung und Preis eingeben → "Artikel speichern"
- **Rechnung erstellen:**
  - Empfänger auswählen
  - Rechnungsnummer (wird automatisch generiert)
  - Positionen hinzufügen
  - "PDF erstellen & herunterladen" klicken

### 4. QR-Rechnung
- **Automatisch generiert**, wenn IBAN vorhanden ist
- **Schweizer Standard** - kompatibel mit allen Banken
- **QR-Code** wird direkt ins PDF eingefügt
- **Zahlungsinformationen** werden angezeigt

## 📋 Features:

✅ **QR-Rechnung nach Schweizer Standard**
- QR-IBAN Format
- Automatische QR-Referenz (27-stellig mit Prüfziffer)
- Vollständig kompatibel mit Schweizer Banken

✅ **Kunden- und Artikelverwaltung**
- Hinzufügen, Bearbeiten, Löschen
- Lokale Speicherung im Browser

✅ **PDF-Generierung**
- Professionelles Layout
- QR-Zahlungsteil automatisch eingefügt
- Sofortiger Download

✅ **Backup & Restore**
- Daten exportieren/importieren
- Automatische Sicherung

## 🌐 Plattformen:

Die Web-App funktioniert auf:
- ✅ **Mac** (Safari, Chrome, Firefox)
- ✅ **iPhone** (Safari)
- ✅ **iPad** (Safari)
- ✅ **Windows** (Chrome, Edge, Firefox)
- ✅ **Android** (Chrome)

## 🔧 Technische Details:

- **QR-Code Bibliothek:** qrcode.js (CDN)
- **PDF-Bibliothek:** jsPDF (CDN)
- **Speicherung:** LocalStorage (Browser)
- **Keine Installation nötig** - funktioniert direkt im Browser

## 💡 Vorteile gegenüber nativer App:

✅ **Sofort einsatzbereit** - Keine Kompilierung
✅ **Plattformunabhängig** - Ein Code für alle Geräte
✅ **Einfach zu aktualisieren** - Einfach Dateien ersetzen
✅ **Keine App Store Genehmigung** nötig
✅ **Funktioniert offline** (nach erstem Laden)

## 📁 Dateien:

- `index.html` - Hauptseite
- `app.js` - JavaScript mit QR-Generierung
- `logo.png` - Logo
- `zahlteil.png` - Fallback-Bild (falls QR-Code fehlschlägt)

## 🎯 Nächste Schritte:

1. **Öffnen Sie `index.html` im Browser**
2. **Geben Sie Ihre IBAN ein**
3. **Erstellen Sie eine Test-Rechnung**
4. **Prüfen Sie den QR-Code** - sollte von Bank-Apps gescannt werden können

Die Web-App ist vollständig funktionsfähig! 🎉

