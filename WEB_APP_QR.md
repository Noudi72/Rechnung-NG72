# Web-App mit QR-Rechnung - Fertig! ✅

## Was wurde hinzugefügt:

### 1. ✅ QR-Rechnung Generator nach Schweizer Standard
- Vollständige Implementierung des QR-IBAN Standards
- Automatische QR-Referenz-Generierung (27-stellig mit Prüfziffer)
- QR-Code-Generierung mit qrcode.js Bibliothek

### 2. ✅ IBAN-Verwaltung
- IBAN-Eingabefeld hinzugefügt
- IBAN wird lokal gespeichert
- Wird für QR-Rechnung verwendet

### 3. ✅ QR-Code im PDF
- QR-Code wird automatisch generiert und ins PDF eingefügt
- Zahlungsinformationen werden neben dem QR-Code angezeigt
- Fallback auf altes Bild, falls QR-Code-Generierung fehlschlägt

## Verwendung:

1. **IBAN eingeben:**
   - Geben Sie Ihre IBAN im Feld "IBAN (für QR-Rechnung)" ein
   - Klicken Sie auf "IBAN speichern"

2. **Rechnung erstellen:**
   - Wählen Sie einen Empfänger
   - Fügen Sie Positionen hinzu
   - Klicken Sie auf "PDF erstellen & herunterladen"

3. **QR-Rechnung:**
   - Wenn IBAN vorhanden ist, wird automatisch ein QR-Code generiert
   - Der QR-Code entspricht dem Schweizer QR-IBAN Standard
   - Kann von allen Schweizer Banken gescannt werden

## Vorteile der Web-App:

✅ **Funktioniert sofort** - Keine Kompilierung nötig
✅ **Plattformunabhängig** - Läuft auf Mac, Windows, iPhone, iPad
✅ **Einfach zu verwenden** - Einfach im Browser öffnen
✅ **QR-Rechnung Standard** - Vollständig kompatibel mit Schweizer Banken
✅ **Keine Installation** - Funktioniert direkt

## Dateien:

- `index.html` - Hauptseite (aktualisiert)
- `app.js` - JavaScript mit QR-Generierung (aktualisiert)
- `logo.png` - Logo (bereits vorhanden)

## Öffnen der App:

1. **Im Browser:**
   - Doppelklicken Sie auf `index.html`
   - Oder ziehen Sie die Datei in den Browser

2. **Oder lokal starten:**
   ```bash
   # Im Terminal:
   cd /Users/noelguyaz/Projekte/Rechnung-NG72
   python3 -m http.server 8000
   # Dann öffnen: http://localhost:8000
   ```

Die Web-App ist jetzt vollständig funktionsfähig mit QR-Rechnung! 🎉

