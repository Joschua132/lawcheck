# LawCheck

Die App soll vor allem Menschen, die nicht Deutsch können, helfen, deutsche Anwaltsbriefe zu verstehen und zu lesen und die Zusammenhänge zu verstehen innerhalb des Briefs. Dabei wollen wir halt, dass sie ein Dokument einscannen können, das deutsch ist, und sie als Output eine übersetzte Version bekommen als PDF, die man downloaden kann, die auch von der Struktur her ähnlich ist

**Zielgruppe:** Eltern mit Migrationshintergund, Kinder von Migranten

---

## Features

- **PDF Upload**
- **KI-Übersetzung/Analyse**
- **PDF Export**

---

## Tech Stack

| Technologie | Verwendung |
|---|---|
| React 18 + Vite | Frontend Framework |
| Tailwind CSS + shadcn/ui | Styling & UI Komponenten |
| Google Gemini 2.0 Flash | KI-Analyse |
| React Router v7 | Client-seitiges Routing |
| TypeScript | Typsicherheit |
| Vercel | Hosting |

---

## Setup

### Voraussetzungen
- Node.js ≥ 18

### Installation

```bash
git clone https://github.com/DEIN-USERNAME/lawcheck.git
cd "lawcheck/UI/LawCheck Web App Design"
pnpm install
```

### Umgebungsvariablen

```bash
cp .env.example .env.local
# .env.local befüllen:
# API_KEY=dein_gemini_api_key
# ALLOWED_ORIGIN=http://localhost:5173
```

### Entwicklung

```bash
pnpm run dev        # Vite Dev Server auf http://localhost:5173
# Für Serverless Functions lokal:
vercel dev
```

### Build

```bash
pnpm run build
```

---

## Deployment

Live: *[URL nach Deployment eintragen]*

Deployed auf Vercel. Umgebungsvariablen in den Vercel Dashboard-Settings eintragen.

---

*Erstellt mit Figma AI (UI Design) + Claude Code (Implementierung)*
