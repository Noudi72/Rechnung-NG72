# Rechnung NG72 - Native iOS/macOS App

Eine native SwiftUI-App für iPhone, iPad und Mac, die Rechnungen mit QR-Zahlungsteil nach Schweizer Standard erstellt.

## Features

- ✅ Native App für iOS, iPadOS und macOS
- ✅ QR-Rechnung Generator nach Schweizer Standard
- ✅ Kunden- und Artikelverwaltung
- ✅ PDF-Generierung mit QR-Zahlungsteil
- ✅ Automatische Rechnungsnummern
- ✅ Lokale Datenspeicherung

## Installation

### Voraussetzungen

- Xcode 15.0 oder höher
- macOS 13.0 oder höher (für Entwicklung)
- Apple Developer Account (für Geräte-Deployment)

### Projekt einrichten

1. Öffnen Sie Xcode
2. Wählen Sie "File" > "New" > "Project"
3. Wählen Sie "App" unter iOS/macOS
4. Wählen Sie SwiftUI als Interface
5. Kopieren Sie alle Dateien aus dem `RechnungNG72` Ordner in Ihr Projekt

### Projektstruktur

```
RechnungNG72/
├── RechnungNG72App.swift      # App Entry Point
├── ContentView.swift           # Hauptansicht
├── Models/
│   └── InvoiceModels.swift    # Datenmodelle
└── Services/
    ├── QRInvoiceGenerator.swift    # QR-Rechnung Generator
    ├── PDFGenerator.swift         # PDF-Generierung
    ├── PDFGeneratorHelper.swift   # PDF Helper
    └── DataManager.swift          # Datenverwaltung
```

## Verwendung

### IBAN einrichten

1. Öffnen Sie die App
2. Geben Sie Ihre IBAN im Feld "IBAN" ein
3. Klicken Sie auf "Speichern"

### Kunden hinzufügen

1. Geben Sie Name, Adresse und PLZ/Ort ein
2. Klicken Sie auf "Kunde speichern"

### Artikel hinzufügen

1. Geben Sie Bezeichnung und Preis ein
2. Klicken Sie auf "Artikel speichern"

### Rechnung erstellen

1. Wählen Sie einen Empfänger aus
2. Die Rechnungsnummer wird automatisch generiert (kann manuell geändert werden)
3. Fügen Sie Positionen hinzu:
   - Wählen Sie einen Artikel
   - Geben Sie die Menge ein
   - Klicken Sie auf "+ Position"
4. Klicken Sie auf "PDF erstellen"
5. Die PDF-Vorschau wird angezeigt
6. Teilen oder speichern Sie die PDF

## QR-Rechnung Standard

Die App generiert QR-Codes nach dem Schweizer QR-Rechnung Standard (QR-IBAN). Der QR-Code enthält:

- IBAN (QR-IBAN)
- Gläubiger-Informationen
- Betrag
- Währung (CHF)
- QR-Referenz (27-stellig)
- Zusätzliche Informationen (Rechnungsnummer)

### QR-Referenz

Die QR-Referenz wird automatisch aus der Rechnungsnummer generiert und erfüllt die Anforderungen des Schweizer Standards (27 Stellen mit Prüfziffer).

## Technische Details

### Plattformen

- **iOS**: iPhone und iPad
- **macOS**: Native Mac App (mit Catalyst Support)

### Frameworks

- SwiftUI für die Benutzeroberfläche
- CoreImage für QR-Code-Generierung
- PDFKit für PDF-Generierung
- UserDefaults für lokale Datenspeicherung

### Datenmodell

- **Customer**: Kundeninformationen
- **Article**: Artikel mit Preis
- **InvoicePosition**: Rechnungsposition mit Artikel und Menge
- **Invoice**: Vollständige Rechnung

## Anpassungen

### Absender-Informationen

Die Absender-Informationen können in `InvoiceModels.swift` angepasst werden:

```swift
struct SenderInfo {
    static let name = "Ihr Name"
    static let address = "Ihre Adresse"
    static let city = "PLZ Ort"
}
```

### Standard-Fusszeile

Die Standard-Fusszeile kann in `DataManager.swift` angepasst werden.

## Bekannte Einschränkungen

- Backup/Restore-Funktion ist noch nicht vollständig implementiert
- Logo muss als "logo.png" im Asset-Katalog vorhanden sein

## Lizenz

Dieses Projekt ist für den persönlichen Gebrauch erstellt.

## Support

Bei Fragen oder Problemen kontaktieren Sie: n.guyaz@icloud.com

