const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { exec, execSync } = require('child_process');
const { diffLines } = require('diff');
const os = require('os');

const CONTEXT_LINES = 3;
const PROJECTS_BACKUP_FOLDER = 'Projects Backup';

// Folders to always skip during backup
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', '.git', '__pycache__', 'release']);

// ─── App Data Directory — single source of truth for ALL saves ───────────────
// Χρησιμοποιούμε process.env.APPDATA για να δουλεύει σε οποιονδήποτε χρήστη
// → C:\Users\<username>\AppData\Roaming\ThomasThanos\Backup-projects
const APP_DATA_DIR = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'ThomasThanos', 'Backup-projects');

// All save files live under APP_DATA_DIR
const CONFIG_FILE = path.join(APP_DATA_DIR, 'projects.json');

// Ensure the directory exists before any write
function ensureAppDataDir() {
    fs.mkdirSync(APP_DATA_DIR, { recursive: true });
}

// ─── Default project ──────────────────────────────────────────────────────────
const DEFAULT_PROJECT = {
    id: 'default',
    name: 'MakeYourLifeEasier',
    sourcePath: path.join('D:', 'Projects', 'Make_Your_Life_Easier.A.E'),
    appExe: 'Make_Your_Life_Easier.A.E.exe',
    appName: 'MakeYourLifeEasier'
};

// ─── Config helpers ───────────────────────────────────────────────────────────
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            if (!raw.projects || raw.projects.length === 0) {
                raw.projects = [DEFAULT_PROJECT];
                raw.activeProjectId = 'default';
            }
            return raw;
        }
    } catch (e) { /* fall through */ }

    const config = { activeProjectId: 'default', projects: [DEFAULT_PROJECT] };
    saveConfig(config);
    return config;
}

function saveConfig(config) {
    ensureAppDataDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

function getActiveProject(config) {
    return config.projects.find(p => p.id === config.activeProjectId) || config.projects[0];
}

// ─── Dropbox Detection ────────────────────────────────────────────────────────
function getDropboxPath() {
    const candidates = [
        path.join(os.homedir(), 'AppData', 'Roaming', 'Dropbox', 'info.json'),
        path.join(os.homedir(), 'AppData', 'Local', 'Dropbox', 'info.json')
    ];

    for (const infoFile of candidates) {
        try {
            if (fs.existsSync(infoFile)) {
                const info = JSON.parse(fs.readFileSync(infoFile, 'utf8'));
                const dropboxPath = info?.personal?.path || info?.business?.path;
                if (dropboxPath && fs.existsSync(dropboxPath)) return dropboxPath;
            }
        } catch {}
    }

    const defaults = [
        path.join(os.homedir(), 'Dropbox'),
        path.join(os.homedir(), 'OneDrive', 'Dropbox'),
    ];
    for (const d of defaults) {
        if (fs.existsSync(d)) return d;
    }

    return null;
}

function isDropboxRunning() {
    try {
        const result = execSync('tasklist /FI "IMAGENAME eq Dropbox.exe" /NH', { encoding: 'utf8', timeout: 3000 });
        return result.toLowerCase().includes('dropbox.exe');
    } catch {
        return false;
    }
}

function getDropboxStatus() {
    const dropboxPath = getDropboxPath();
    if (!dropboxPath) return { found: false, running: false, path: null };
    return { found: true, running: isDropboxRunning(), path: dropboxPath };
}

// {DropboxPath}/Projects Backup/{appName}  — created automatically if missing
function resolveDestPath(project) {
    const status = getDropboxStatus();
    if (!status.found) return null;
    const dest = path.join(status.path, PROJECTS_BACKUP_FOLDER, project.appName);
    fs.mkdirSync(dest, { recursive: true });
    return dest;
}

// ─── Window ──────────────────────────────────────────────────────────────────
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 1000,
        minHeight: 700,
        frame: false,
        webPreferences: { nodeIntegration: true, contextIsolation: false },
        icon: path.join(__dirname, 'backup.ico'),
        backgroundColor: '#0c0c14',
        show: false
    });
    mainWindow.loadFile('index.html');
    mainWindow.once('ready-to-show', () => mainWindow.show());
}

// Force Electron to store ALL its data (localStorage, cache, etc.) in our folder
app.setPath('userData', APP_DATA_DIR);

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ─── Window controls ──────────────────────────────────────────────────────────
ipcMain.handle('window-minimize',     () => mainWindow.minimize());
ipcMain.handle('window-maximize',     () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.handle('window-close',        () => mainWindow.close());
ipcMain.handle('window-is-maximized', () => mainWindow.isMaximized());

// ─── Dropbox IPC ──────────────────────────────────────────────────────────────
ipcMain.handle('get-dropbox-status', () => getDropboxStatus());

ipcMain.handle('launch-dropbox', () => {
    const candidates = [
        path.join(os.homedir(), 'AppData', 'Local', 'Dropbox', 'Dropbox.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Dropbox', 'client', 'Dropbox.exe'),
        'C:\\Program Files (x86)\\Dropbox\\Client\\Dropbox.exe',
        'C:\\Program Files\\Dropbox\\Client\\Dropbox.exe',
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            exec(`"${candidate}"`);
            return { success: true, path: candidate };
        }
    }

    exec('start "" "Dropbox.exe"', { shell: true });
    return { success: true, path: 'shell' };
});

// ─── Project management IPC ──────────────────────────────────────────────────
ipcMain.handle('get-projects', () => loadConfig());

ipcMain.handle('add-project', (event, project) => {
    const config = loadConfig();
    const newProj = { id: Date.now().toString(), ...project };
    config.projects.push(newProj);
    config.activeProjectId = newProj.id;
    saveConfig(config);
    return { success: true, project: newProj };
});

ipcMain.handle('update-project', (event, project) => {
    const config = loadConfig();
    const idx = config.projects.findIndex(p => p.id === project.id);
    if (idx !== -1) config.projects[idx] = project;
    saveConfig(config);
    return { success: true };
});

ipcMain.handle('remove-project', (event, projectId) => {
    const config = loadConfig();
    if (config.projects.length <= 1) return { success: false, error: 'Πρέπει να υπάρχει τουλάχιστον ένα project.' };
    config.projects = config.projects.filter(p => p.id !== projectId);
    if (config.activeProjectId === projectId) config.activeProjectId = config.projects[0].id;
    saveConfig(config);
    return { success: true };
});

ipcMain.handle('set-active-project', (event, projectId) => {
    const config = loadConfig();
    config.activeProjectId = projectId;
    saveConfig(config);
    return { success: true };
});

ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
    if (result.canceled) return null;
    return result.filePaths[0] || null;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonthFolder() {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const names = ['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος',
                   'Μάιος','Ιούνιος','Ιούλιος','Αύγουστος',
                   'Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'];
    return `${year}-${month} ${names[now.getMonth()]}`;
}

function parseMonthFolder(folderName) {
    const match = folderName.match(/^(\d{4})-(\d{2})\s+(.+)$/);
    if (match) return { year: parseInt(match[1]), month: parseInt(match[2]), name: match[3], display: `${match[3]} ${match[1]}` };
    return { year: 0, month: 0, name: folderName, display: folderName };
}

function getNextVersion(destPath, appName) {
    try {
        if (!fs.existsSync(destPath)) { fs.mkdirSync(destPath, { recursive: true }); return 1; }
        let maxVersion = 0;
        const monthFolders = fs.readdirSync(destPath).filter(f => fs.statSync(path.join(destPath, f)).isDirectory());
        for (const mf of monthFolders) {
            fs.readdirSync(path.join(destPath, mf))
                .filter(f => f.startsWith(appName + '_D'))
                .forEach(f => {
                    const m = f.match(/_V(\d+)$/);
                    if (m) maxVersion = Math.max(maxVersion, parseInt(m[1]));
                });
        }
        return maxVersion + 1;
    } catch { return 1; }
}

function killApp(appExe) {
    return new Promise(resolve => {
        if (!appExe) return setTimeout(resolve, 200);
        exec(`taskkill /F /IM "${appExe}" /T`, () => setTimeout(resolve, 1000));
    });
}

function getAllFiles(dirPath, arrayOfFiles = [], basePath = dirPath) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    fs.readdirSync(dirPath).forEach(file => {
        if (EXCLUDED_DIRS.has(file)) return;
        const fullPath     = path.join(dirPath, file);
        const relativePath = path.relative(basePath, fullPath);
        if (fs.statSync(fullPath).isDirectory()) getAllFiles(fullPath, arrayOfFiles, basePath);
        else arrayOfFiles.push({ path: relativePath, fullPath });
    });
    return arrayOfFiles;
}

function getFileContent(filePath) {
    try { return fs.readFileSync(filePath, 'utf8'); } catch { return '[Binary file]'; }
}

function calculateDiff(oldBackupPath, newBackupPath) {
    const diffs = [];
    const oldFiles   = getAllFiles(oldBackupPath);
    const newFiles   = getAllFiles(newBackupPath);
    const oldFileMap = new Map(oldFiles.map(f => [f.path, f.fullPath]));
    const newFileMap = new Map(newFiles.map(f => [f.path, f.fullPath]));

    for (const [relativePath, oldFullPath] of oldFileMap) {
        if (newFileMap.has(relativePath)) {
            const oldContent = getFileContent(oldFullPath);
            const newContent = getFileContent(newFileMap.get(relativePath));
            if (oldContent !== newContent && oldContent !== '[Binary file]')
                diffs.push({ file: relativePath, status: 'modified', changes: diffLines(oldContent, newContent) });
        } else {
            diffs.push({ file: relativePath, status: 'deleted', changes: [] });
        }
    }
    for (const [relativePath] of newFileMap) {
        if (!oldFileMap.has(relativePath))
            diffs.push({ file: relativePath, status: 'added', changes: [] });
    }
    return diffs;
}

function getFolderSizeRaw(folderPath) {
    let total = 0;
    try {
        fs.readdirSync(folderPath, { withFileTypes: true }).forEach(f => {
            try {
                const fp = path.join(folderPath, f.name);
                total += f.isFile() ? (fs.statSync(fp).size || 0) : getFolderSizeRaw(fp);
            } catch {}
        });
    } catch {}
    return total;
}

function getFolderSize(folderPath) { return formatBytes(getFolderSizeRaw(folderPath)); }

function formatBytes(bytes) {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i < 0 || i >= sizes.length || isNaN(i)) return '0 B';
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function copyFolderRecursive(source, dest, sourceRoot) {
    const entries = fs.readdirSync(source, { withFileTypes: true });
    for (const entry of entries) {
        if (EXCLUDED_DIRS.has(entry.name)) continue;
        const srcPath  = path.join(source, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            await copyFolderRecursive(srcPath, destPath, sourceRoot);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// ─── Backup IPC ───────────────────────────────────────────────────────────────
ipcMain.handle('get-backups', async () => {
    try {
        const config   = loadConfig();
        const project  = getActiveProject(config);
        const destPath = resolveDestPath(project);
        if (!destPath || !fs.existsSync(destPath)) return [];

        const allBackups = [];
        const monthFolders = fs.readdirSync(destPath)
            .filter(f => {
                if (f.toLowerCase() === 'all - pre release backups') return false;
                return fs.statSync(path.join(destPath, f)).isDirectory();
            })
            .sort().reverse();

        for (const mf of monthFolders) {
            const monthPath = path.join(destPath, mf);
            const monthInfo = parseMonthFolder(mf);

            fs.readdirSync(monthPath)
                .filter(f => f.startsWith(project.appName))
                .forEach(f => {
                    const fullPath = path.join(monthPath, f);
                    const stats    = fs.statSync(fullPath);
                    let day = 0, version = 0;
                    const newMatch = f.match(/_D(\d+)_V(\d+)$/);
                    const oldMatch = f.match(/_V(\d+)_D(\d+)$/);
                    if (newMatch)      { day = parseInt(newMatch[1]); version = parseInt(newMatch[2]); }
                    else if (oldMatch) { version = parseInt(oldMatch[1]); day = parseInt(oldMatch[2]); }

                    let isMigrated = false;
                    try { if (!fs.existsSync(path.join(fullPath, '.backup-info.json'))) isMigrated = true; } catch {}

                    allBackups.push({
                        name: f, path: fullPath,
                        monthFolder: mf, monthDisplay: monthInfo.display,
                        version, day,
                        date: stats.mtime.toLocaleString('el-GR'),
                        timestamp: stats.mtime.getTime(),
                        size: getFolderSize(fullPath),
                        isMigrated
                    });
                });
        }
        return allBackups.sort((a, b) => b.version - a.version);
    } catch { return []; }
});

ipcMain.handle('get-paths', async () => {
    const config   = loadConfig();
    const project  = getActiveProject(config);
    const destPath = resolveDestPath(project) || '(Dropbox not found)';
    return { source: project.sourcePath, dest: destPath };
});

ipcMain.handle('create-backup', async () => {
    try {
        const config  = loadConfig();
        const project = getActiveProject(config);
        const { sourcePath, appExe, appName } = project;

        const dropboxStatus = getDropboxStatus();
        if (!dropboxStatus.found)
            return { success: false, error: 'Δεν βρέθηκε το Dropbox. Βεβαιώσου ότι είναι εγκατεστημένο.' };
        if (!dropboxStatus.running)
            return { success: false, error: 'Το Dropbox δεν τρέχει. Άνοιξέ το και δοκίμασε ξανά.' };

        const destPath = resolveDestPath(project);
        if (!destPath) return { success: false, error: 'Αδύνατη εύρεση/δημιουργία φακέλου Dropbox.' };

        mainWindow.webContents.send('backup-status', 'Κλείσιμο εφαρμογής...');
        await killApp(appExe);

        mainWindow.webContents.send('backup-status', 'Προετοιμασία...');

        const now         = new Date();
        const version     = getNextVersion(destPath, appName);
        const day         = now.getDate();
        const monthFolder = getMonthFolder();
        const backupName  = `${appName}_D${day}_V${version}`;

        const monthPath  = path.join(destPath, monthFolder);
        const destFolder = path.join(monthPath, backupName);
        fs.mkdirSync(destFolder, { recursive: true });

        mainWindow.webContents.send('backup-status', 'Αντιγραφή αρχείων...');
        await copyFolderRecursive(sourcePath, destFolder, sourcePath);

        const metadata = {
            name: backupName, version, day, monthFolder,
            createdAt: now.toISOString(),
            timestamp: now.getTime(),
            displayDate: now.toLocaleString('el-GR')
        };
        fs.writeFileSync(
            path.join(destFolder, '.backup-info.json'),
            JSON.stringify(metadata, null, 2),
            'utf8'
        );

        mainWindow.webContents.send('backup-status', 'Ολοκληρώθηκε!');
        return { success: true, backupName, path: destFolder, monthFolder };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-backup', async (event, backupPath) => {
    for (let attempt = 1; attempt <= 5; attempt++) {
        try { await fs.remove(backupPath); return { success: true }; }
        catch (error) {
            if (error.code !== 'EBUSY' || attempt === 5) return { success: false, error: error.message };
            await new Promise(r => setTimeout(r, 1000));
        }
    }
});

ipcMain.handle('get-diff', async (event, backup1, backup2) => {
    try { return { success: true, diffs: calculateDiff(backup1, backup2) }; }
    catch (error) { return { success: false, error: error.message }; }
});

ipcMain.handle('get-file-diff', async (event, backup1Path, backup2Path, filePath) => {
    try {
        const file1    = path.join(backup1Path, filePath);
        const file2    = path.join(backup2Path, filePath);
        const content1 = fs.existsSync(file1) ? getFileContent(file1) : '';
        const content2 = fs.existsSync(file2) ? getFileContent(file2) : '';

        const rawChanges = diffLines(content1, content2);
        const flattened  = [];
        rawChanges.forEach(part => {
            const lines = part.value.split('\n');
            lines.forEach((line, idx) => {
                if (idx === lines.length - 1 && line === '') return;
                flattened.push({ value: line, added: !!part.added, removed: !!part.removed });
            });
        });

        const changedIndices = flattened
            .map((ln, i) => (ln.added || ln.removed) ? i : -1)
            .filter(i => i !== -1);
        let contextualChanges = [];

        if (changedIndices.length > 0) {
            const ranges = [];
            let start = Math.max(0, changedIndices[0] - CONTEXT_LINES);
            let end   = Math.min(flattened.length - 1, changedIndices[0] + CONTEXT_LINES);
            for (let i = 1; i < changedIndices.length; i++) {
                const ns = Math.max(0, changedIndices[i] - CONTEXT_LINES);
                const ne = Math.min(flattened.length - 1, changedIndices[i] + CONTEXT_LINES);
                if (ns <= end + 1) { end = Math.max(end, ne); }
                else { ranges.push([start, end]); start = ns; end = ne; }
            }
            ranges.push([start, end]);
            let cur = 0;
            ranges.forEach(([s, e]) => {
                if (s > cur) contextualChanges.push({ value: '...', added: false, removed: false, omitted: true });
                for (let i = s; i <= e; i++) contextualChanges.push(flattened[i]);
                cur = e + 1;
            });
        }

        return { success: true, changes: contextualChanges, oldContent: content1, newContent: content2 };
    } catch (error) { return { success: false, error: error.message }; }
});

ipcMain.handle('open-folder', (event, folderPath) => {
    exec(`explorer "${folderPath}"`);
    return { success: true };
});
