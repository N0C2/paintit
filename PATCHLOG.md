# Paint.IT – Patchlog

## Version 2.1.0 (2025-09-23)

Diese Version behebt kritische Fehler in der Datenbankinteraktion, verbessert die Benutzeroberfläche und optimiert die Benutzerfreundlichkeit.

### Bug Fixes

- **Datenbank-Schema:** Behebt einen schwerwiegenden Fehler, bei dem die Anwendung versuchte, auf nicht existierende Spalten (`branchId`, `userId`) in den Tabellen `orders` und `user_branches` zuzugreifen. Die Abfragen wurden korrigiert, um die korrekten Spaltennamen (`branch`, `user_id`, `branch_id`) zu verwenden.
- **Benutzererstellung:** Behebt einen Validierungsfehler (422 Unprocessable Entity), der auftrat, weil das Frontend `status` anstelle von `role` an das Backend sendete. Die Formular- und Backend-Logik wurde vereinheitlicht.

### Features & Improvements

- **Auftragsdetails:** Die Ansicht der Auftragsdetails wurde komplett überarbeitet. Sie verwendet jetzt ein modernes, kartenbasiertes Layout mit Bootstrap, um die Informationen klarer und optisch ansprechender darzustellen.
- **Benutzerverwaltung:** Der Link "Benutzer anlegen" wurde aus der Seitenleiste entfernt und als prominenter Button in die Benutzerverwaltungsseite verschoben, um die Navigation zu verbessern.
- **Abgeschlossene Aufträge:** In der Liste der abgeschlossenen Aufträge wurde der "Bearbeiten"-Button durch einen "Ansehen"-Button ersetzt, der direkt zur Detailansicht des Auftrags führt.

### Dokumentation

- **README.md:** Die `README.md`-Datei wurde von Grund auf neu geschrieben, um die aktuelle Funktionalität, die verwendeten Technologien und eine vereinfachte, benutzerfreundliche Installationsanleitung widerzuspiegeln, die den Web-basierten Setup-Prozess hervorhebt.
- **PATCHLOG.md:** Dieses Dokument wurde neu strukturiert, um eine klare, versionierte Liste der Änderungen zu bieten.

## Version 2.0.0 (2025-09-22)

- **Feature:** Fertigstellungsdatum kann in der Auftragsliste inline bearbeitet werden. Das alte Datum wird dauerhaft gespeichert und unter dem neuen angezeigt.
- **Feature:** Abgeschlossene Aufträge werden aus der Hauptliste entfernt und separat gelistet.
- **Fix:** Sidebar-Navigation markiert jetzt immer korrekt den aktiven Menüpunkt.
- **Setup:** Datenbank-Setup legt jetzt das Feld `previousCompletionDate` in der Tabelle `orders` automatisch an.
- **Doku:** index.html mit Projektdokumentation und Setup-Anleitung hinzugefügt.