# QR-Code Debugging

## Was wurde verbessert:

### 1. ✅ QRCode Bibliothek URL korrigiert
- Neue URL: `https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js`
- Sollte jetzt zuverlässig laden

### 2. ✅ QR-Code Generierung verbessert
- Temporärer Canvas wird erstellt
- Besseres Error-Handling
- Debugging-Logs hinzugefügt

### 3. ✅ PDF-Einfügung verbessert
- "Zahlteil" Überschrift hinzugefügt
- Bessere Formatierung der Zahlungsinformationen
- Rahmen und Trennlinien hinzugefügt

## So testen Sie:

1. **Browser Console öffnen** (⌘⌥I)
2. **PDF erstellen** klicken
3. **Schauen Sie in die Console** nach:
   - `🔄 Generiere QR-Code...`
   - `✅ QR-Code erfolgreich generiert`
   - `✅ QR-Code Bild ins PDF eingefügt`

## Falls QR-Code nicht erscheint:

### Problem: QRCode Bibliothek nicht geladen
**Lösung:**
- Prüfen Sie die Console nach 404-Fehlern
- Die Bibliothek sollte von unpkg.com geladen werden

### Problem: QR-Code wird generiert, aber nicht angezeigt
**Lösung:**
- Prüfen Sie die Position (y=200mm könnte zu weit unten sein)
- Prüfen Sie ob das Bild ins PDF eingefügt wird

### Problem: QR-Code ist zu klein/groß
**Lösung:**
- Aktuelle Größe: 46mm x 46mm
- Kann in Zeile 647 angepasst werden: `let qrSize = 46;`

## Nächste Schritte:

1. **Seite neu laden** (⌘R)
2. **IBAN eingeben** und speichern
3. **PDF erstellen**
4. **Console prüfen** für Debugging-Informationen

Die QR-Code-Generierung sollte jetzt funktionieren! 🎉

