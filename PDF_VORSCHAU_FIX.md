# PDF-Erstellung und Vorschau - Fehlerbehebung

## Was wurde behoben:

### 1. ✅ Fehlende Fehlerbehandlung
**Problem:** Wenn kein Kunde ausgewählt war oder die PDF-Generierung fehlschlug, gab es keine Fehlermeldung.

**Lösung:**
- Fehlerbehandlung für fehlenden Kunden hinzugefügt
- Fehlerbehandlung für fehlende IBAN (war bereits vorhanden)
- Fehlerbehandlung für leere Positionen hinzugefügt
- Prüfung ob PDF-Daten erfolgreich erstellt wurden
- Fehler-Alert hinzugefügt

### 2. ✅ Vorschau-Button
**Problem:** Vorschau-Button funktionierte auch ohne ausgewählten Kunden.

**Lösung:**
- Prüfung ob Kunde ausgewählt ist, bevor Vorschau geöffnet wird
- Fehlermeldung wenn kein Kunde ausgewählt ist

## Neue Features:

### Fehler-Alerts
- **"Bitte wählen Sie zuerst einen Empfänger aus"** - wenn kein Kunde ausgewählt ist
- **"Bitte fügen Sie mindestens eine Position zur Rechnung hinzu"** - wenn keine Positionen vorhanden sind
- **"Fehler beim Erstellen des PDFs"** - wenn PDF-Generierung fehlschlägt

## Debugging:

Falls PDF-Erstellung oder Vorschau immer noch nicht funktionieren:

### 1. Prüfen Sie die Console
- In Xcode: Unten die Console öffnen (⌘⇧Y)
- Schauen Sie nach Fehlermeldungen beim Klicken auf "PDF erstellen"

### 2. Prüfen Sie die Voraussetzungen
- ✅ Ist ein Kunde ausgewählt?
- ✅ Ist eine IBAN eingegeben?
- ✅ Gibt es mindestens eine Position oder einen Artikel?

### 3. Testen Sie Schritt für Schritt
1. Kunde auswählen
2. IBAN eingeben und speichern
3. Position hinzufügen
4. "Vorschau" klicken (sollte funktionieren)
5. "PDF erstellen" klicken

## Bekannte Probleme:

### macOS PDF-Generierung
Falls auf macOS die PDF-Generierung nicht funktioniert:
- Die macOS-Implementierung verwendet `CGContext` direkt
- Möglicherweise müssen Berechtigungen erteilt werden

### QR-Code Generierung
Falls QR-Code nicht generiert wird:
- Prüfen Sie ob `CoreImage` Framework verfügbar ist
- QR-Code-Generierung benötigt `CIFilter`

## Nächste Schritte:

1. **Testen Sie die App:**
   - Wählen Sie einen Kunden
   - Geben Sie eine IBAN ein
   - Fügen Sie eine Position hinzu
   - Klicken Sie auf "Vorschau" - sollte funktionieren
   - Klicken Sie auf "PDF erstellen" - sollte funktionieren

2. **Falls es immer noch nicht funktioniert:**
   - Schauen Sie in die Xcode Console nach Fehlermeldungen
   - Teilen Sie die Fehlermeldungen mit

Die Fehlerbehandlung sollte jetzt alle Probleme abfangen und hilfreiche Fehlermeldungen anzeigen! 🎉

