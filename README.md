# Paint.IT

## Projektüberblick

Paint.IT ist ein Full-Stack-System zur einfachen Verwaltung von Werkstattaufträgen, Benutzern und Filialen. Es wurde entwickelt, um den Workflow in Lackier- und Karosseriewerkstätten zu digitalisieren und zu optimieren.

### Features

- **Benutzerverwaltung:** Anlegen, Bearbeiten und Löschen von Benutzern mit unterschiedlichen Rollen (Admin, Werkstattleiter, Lackierer etc.).
- **Auftragsmanagement:** Erfassen, Aktualisieren und Verfolgen von Aufträgen mit detaillierten Informationen wie Kundendaten, Fahrzeug-VIN, Lacknummer und zugewiesener Filiale.
- **Multi-Filial-Fähigkeit:** Verwaltung mehrerer Standorte.
- **Status-Tracking:** Aufträge durchlaufen verschiedene Status wie "offen", "in Bearbeitung" und "abgeschlossen".
- **Historie:** Abgeschlossene Aufträge werden in einer separaten Ansicht archiviert.
- **Suche und Filter:** Schnelles Finden von Aufträgen und Benutzern.
- **Web-basiertes Setup:** Eine einfache, geführte Installation direkt im Browser.

## Technologien

- **Frontend:** React mit TypeScript
- **Backend:** Node.js mit Express
- **Datenbank:** MySQL / MariaDB
- **Authentifizierung:** JSON Web Tokens (JWT)

## Voraussetzungen

- Node.js (v18 oder neuer empfohlen)
- npm (wird mit Node.js installiert)
- Ein laufender MySQL- oder MariaDB-Server

## Installation und Start

Das Projekt verfügt über ein einfaches Installationsskript, das sowohl den Server als auch den Client einrichtet und startet.

1. **Abhängigkeiten installieren:**
   Führen Sie das Skript `install-and-start.sh` (für Linux/macOS) oder `install-and-start.bat` (für Windows) aus. Wenn Sie die Skripte nicht verwenden können, führen Sie die folgenden Befehle manuell aus:
   ```bash
   # Server-Abhängigkeiten installieren
   cd server
   npm install

   # Client-Abhängigkeiten installieren
   cd ../client
   npm install
   ```

2. **Anwendung starten:**
   Nach der Installation der Abhängigkeiten können Sie die Anwendung mit den gleichen Skripten (`install-and-start.sh` / `install-and-start.bat`) starten oder die Befehle manuell ausführen:
   ```bash
   # Server starten (im Hauptverzeichnis ausführen)
   cd server
   npm start

   # Client starten (in einem neuen Terminal im Hauptverzeichnis ausführen)
   cd client
   npm run dev
   ```

3. **Web-basiertes Setup:**
   - Öffnen Sie Ihren Browser und navigieren Sie zu der Adresse, die im Client-Terminal angezeigt wird (standardmäßig `http://localhost:5173`).
   - Sie werden durch einen Setup-Prozess geführt, in dem Sie die Datenbankverbindung und den ersten Admin-Benutzer anlegen.
   - Folgen Sie den Anweisungen auf dem Bildschirm, um die Installation abzuschließen.

## Patchlog

Eine detaillierte Liste der Änderungen finden Sie in der Datei [PATCHLOG.md](PATCHLOG.md).