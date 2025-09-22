# Paint.IT

## Projektüberblick
Paint.IT ist ein Fullstack-System zur Verwaltung von Werkstattaufträgen, Benutzern und Filialen.

**Features:**
- Benutzerverwaltung mit Rollen (Admin, Werkstatt, Buchhaltung, etc.)
- Multi-Filial-Unterstützung
- Auftragsmanagement: Anlegen, Bearbeiten, Löschen, Abschließen
- Abgeschlossene Aufträge werden separat gelistet
- Fertigstellungsdatum kann bearbeitet werden, alte Werte werden dokumentiert
- Filter- und Suchfunktionen für Aufträge
- Frontend: React + TypeScript, Backend: Node.js (Express, ES Modules), Datenbank: MariaDB/MySQL
- Authentifizierung via JWT

## Setup-Anleitung

### Voraussetzungen
- Node.js (empfohlen: v18+)
- npm
- MariaDB oder MySQL-Server (empfohlen: MariaDB 10.5+)
- Git (optional)

### Schritt-für-Schritt
1. **Repository klonen**
   ```
   git clone <REPO_URL> paintit
   ```
2. **Datenbank anlegen**
   ```sql
   CREATE DATABASE paintit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. **Backend konfigurieren**
   - Ins `server`-Verzeichnis wechseln
   - `npm install`
   - `.env` Datei anlegen:
     ```
     DB_HOST=localhost
     DB_USER=deinuser
     DB_PASSWORD=deinpasswort
     DB_NAME=paintit
     JWT_SECRET=dein_geheimes_token
     ```
   - Setup ausführen:
     ```
     npm run setup
     ```
   - Server starten:
     ```
     npm start
     ```
4. **Frontend konfigurieren**
   - Ins `client`-Verzeichnis wechseln
   - `npm install`
   - Frontend starten:
     ```
     npm run dev
     ```
5. **Projekt im Browser öffnen**
   - Frontend: http://localhost:5173
   - Backend-API: http://localhost:3001

### Wichtige Abhängigkeiten
- **Server:** express, cors, dotenv, mysql2, bcrypt, jsonwebtoken, crypto, fs/promises
- **Client:** react, react-dom, react-router-dom, typescript, vite

### Hinweise
- Für Produktivbetrieb sichere Passwörter und Umgebungsvariablen verwenden!
- MariaDB/MySQL-User benötigt Rechte zum Anlegen von Tabellen und Datenbanken.
- Frontend und Backend können auf unterschiedlichen Servern laufen, API-URL ggf. anpassen.

## Patchlog
Siehe PATCHLOG.md für die letzten Änderungen.

## Kontakt & Support
Bei Fragen oder Problemen: antimo.cimenes@gmail.com oder im Projekt-Repository ein Issue eröffnen.
