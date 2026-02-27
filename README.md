# ⚡ Backup Studio

Modern Electron app για backup projects με Dropbox integration, multi-project support και diff viewer.

---

## ✨ Features

- 🗂️ **Multi-Project Support** — Πρόσθεσε όσα projects θέλεις, κάνε switch με ένα κλικ
- ☁️ **Dropbox Integration** — Βρίσκει αυτόματα το Dropbox, δημιουργεί τους φακέλους μόνο του, δείχνει live status (Online / Σταματημένο / Δεν βρέθηκε)
- 🚀 **One-click Backup** — Κλείνει την εφαρμογή, αντιγράφει, αποθηκεύει metadata
- 📅 **Monthly Organization** — Οργάνωση κατά μήνα (`2025-02 Φεβρουάριος`)
- 🏷️ **Smart Naming** — `{AppName}_D{day}_V{version}` με global auto-increment version
- 🔍 **Diff Viewer** — GitHub-style σύγκριση μεταξύ οποιονδήποτε δύο backups
- 🗑️ **Excludes** — Παραλείπει αυτόματα `node_modules`, `dist`, `.git`, `release/` μέσα σε `Github-Build-Release`
- 🧹 **Clean Terminal** — Καθαρίζει το terminal πριν από κάθε `npm run`

---

## 📁 Folder Structure

Τα backups αποθηκεύονται αυτόματα στο Dropbox με την παρακάτω δομή:

```
{Dropbox}/
└── Projects Backup/
    └── {AppName}/
        ├── 2025-02 Φεβρουάριος/
        │   ├── {AppName}_D5_V1/
        │   ├── {AppName}_D5_V2/
        │   └── {AppName}_D27_V3/
        └── 2025-03 Μάρτιος/
            └── {AppName}_D1_V4/
```

## ⚙️ App Data

Όλες οι ρυθμίσεις και saves της εφαρμογής αποθηκεύονται στο:

```
C:\Users\Fuck-Windows\AppData\Roaming\ThomasThanos\BackupStudio\
└── projects.json    ← λίστα projects + active project
```

---

## 🚀 Quick Start

```bash
npm install
npm start
```

---

## 📋 Requirements

- Node.js 18+
- Dropbox εγκατεστημένο και ενεργό

---

## 🎨 UI

### Sidebar
- **Dropbox pill** — Live status με κουμπί εκκίνησης αν είναι σταματημένο
- **Project switcher** — Dropdown με edit / delete ανά project
- **Ιστορικό** — Backups ομαδοποιημένα κατά μήνα με Day & Version badges

### Main Panel
- **Πληροφορίες** — Μέγεθος, ημερομηνία, path, version
- **Σύγκριση** — Stats (Νέα / Τροποποιημένα / Διαγραμμένα) + line-by-line diff modal

### Project Modal (Add / Edit)
- Dropbox status banner με live preview του backup path
- Auto-fill App Name από το Όνομα (αφαιρεί spaces & special chars)
- Info tooltip `?` που εξηγεί τη λογική του naming
- Browse button για source folder

---

## 📝 Backup Naming

```
{AppName}_D{day}_V{version}

π.χ. MakeYourLifeEasier_D27_V42
      └─────────────────┘ └─┘ └─┘
           App Name      Day  Version (global, αυξάνεται συνεχώς)
```

---

## 🛠️ Build

```bash
npm run build
```

Δημιουργεί NSIS installer + portable `.exe` στον φάκελο `dist/`.

---

## 📂 Project Files

```
BackupApp/
├── main.js         ← Electron main process, όλο το backend
├── app.jsx         ← React UI
├── styles.css      ← Dark theme styles
├── index.html      ← Entry point
├── package.json
├── install.bat
├── run.bat
└── README.md
```

---

Made with ⚡ by ThomasThanos
