const { ipcRenderer } = require('electron');

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const Icons = {
    Bolt: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>),
    Minimize: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>),
    Maximize: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>),
    Restore: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="13" height="13" rx="2" /><path d="M6 9V6a2 2 0 0 1 2-2h3" /></svg>),
    Close: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
    Rocket: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>),
    History: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>),
    Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
    HardDrive: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="12" x2="2" y2="12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><line x1="6" y1="16" x2="6.01" y2="16" /><line x1="10" y1="16" x2="10.01" y2="16" /></svg>),
    Folder: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>),
    FolderOpen: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" /></svg>),
    Trash: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>),
    Info: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>),
    GitCompare: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M11 18H8a2 2 0 0 1-2-2V9" /></svg>),
    ArrowRight: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>),
    ChevronRight: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>),
    ChevronDown: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>),
    Search: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>),
    Clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
    Tag: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>),
    FileCode: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m10 13-2 2 2 2" /><path d="m14 17 2-2-2-2" /></svg>),
    Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
    AlertCircle: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>),
    Package: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>),
    Sparkles: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>),
    AlertTriangle: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>),
    Plus: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
    Settings: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>),
    Edit: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>),
};

// ─── Empty state for new project form ────────────────────────────────────────
const emptyProject = { name: '', sourcePath: '', appExe: '', appName: '' };

function App() {
    // ── Dropbox state ──
    const [dropboxStatus, setDropboxStatus] = React.useState({ found: null, running: null, path: null });

    // ── Projects state ──
    const [projects, setProjects]               = React.useState([]);
    const [activeProjectId, setActiveProjectId] = React.useState(null);
    const [showProjectsDropdown, setShowProjectsDropdown] = React.useState(false);
    const [showProjectModal, setShowProjectModal]         = React.useState(false);
    const [editingProject, setEditingProject]             = React.useState(null); // null = add new
    const [projectForm, setProjectForm]                   = React.useState(emptyProject);
    const [deleteProjectModal, setDeleteProjectModal]     = React.useState(null);

    // ── Backups state ──
    const [backups, setBackups]           = React.useState([]);
    const [selectedBackup, setSelectedBackup] = React.useState(null);
    const [activeTab, setActiveTab]       = React.useState('info');
    const [isLoading, setIsLoading]       = React.useState(false);
    const [backupStatus, setBackupStatus] = React.useState('');
    const [toast, setToast]               = React.useState(null);
    const [isMaximized, setIsMaximized]   = React.useState(false);
    const [paths, setPaths]               = React.useState({ source: '', dest: '' });
    const [deleteModal, setDeleteModal]   = React.useState(null);

    const [diffBackup1, setDiffBackup1]         = React.useState('');
    const [diffBackup2, setDiffBackup2]         = React.useState('');
    const [diffResults, setDiffResults]         = React.useState(null);
    const [selectedFileDiff, setSelectedFileDiff] = React.useState(null);

    // ── Init ──
    React.useEffect(() => {
        loadProjects();
        checkDropbox();
        ipcRenderer.on('backup-status', (event, status) => setBackupStatus(status));
        ipcRenderer.invoke('window-is-maximized').then(setIsMaximized);
        return () => ipcRenderer.removeAllListeners('backup-status');
    }, []);

    const checkDropbox = async () => {
        const status = await ipcRenderer.invoke('get-dropbox-status');
        setDropboxStatus(status);
    };

    const launchDropbox = async () => {
        await ipcRenderer.invoke('launch-dropbox');
        showToast('Εκκίνηση Dropbox… αναμένε 3 δευτερόλεπτα');
        // Re-check after a delay to update the pill
        setTimeout(checkDropbox, 3500);
    };

    // Close dropdown on outside click
    React.useEffect(() => {
        if (!showProjectsDropdown) return;
        const handler = () => setShowProjectsDropdown(false);
        setTimeout(() => document.addEventListener('click', handler), 0);
        return () => document.removeEventListener('click', handler);
    }, [showProjectsDropdown]);

    // ── Project loaders ──
    const loadProjects = async () => {
        const config = await ipcRenderer.invoke('get-projects');
        setProjects(config.projects);
        setActiveProjectId(config.activeProjectId);
        // Load backups for that project
        await refreshBackups();
        await refreshPaths();
    };

    const refreshBackups = async () => {
        const result = await ipcRenderer.invoke('get-backups');
        setBackups(result);
        setSelectedBackup(prev => {
            if (!prev && result.length > 0) return result[0];
            // Keep selected if still exists
            const still = result.find(b => b.name === prev?.name);
            return still || (result.length > 0 ? result[0] : null);
        });
        if (result.length >= 2) {
            setDiffBackup1(result[1].path);
            setDiffBackup2(result[0].path);
        } else {
            setDiffBackup1('');
            setDiffBackup2('');
        }
        setDiffResults(null);
    };

    const refreshPaths = async () => {
        const result = await ipcRenderer.invoke('get-paths');
        setPaths(result);
    };

    const switchProject = async (projectId) => {
        await ipcRenderer.invoke('set-active-project', projectId);
        setActiveProjectId(projectId);
        setSelectedBackup(null);
        setShowProjectsDropdown(false);
        await refreshBackups();
        await refreshPaths();
    };

    // ── Project CRUD ──
    const openAddProjectModal = () => {
        setEditingProject(null);
        setProjectForm(emptyProject);
        setShowProjectModal(true);
        checkDropbox();
    };

    const openEditProjectModal = (project) => {
        setEditingProject(project);
        setProjectForm({
            name: project.name,
            sourcePath: project.sourcePath,
            destPath: project.destPath,
            appExe: project.appExe || '',
            appName: project.appName
        });
        setShowProjectModal(true);
        setShowProjectsDropdown(false);
    };

    const handleBrowseFolder = async (field) => {
        const selected = await ipcRenderer.invoke('select-folder');
        if (selected) {
            setProjectForm(prev => ({ ...prev, [field]: selected }));
        }
    };

    const handleSaveProject = async () => {
        if (!projectForm.name.trim() || !projectForm.sourcePath.trim() || !projectForm.appName.trim()) {
            showToast('Συμπλήρωσε όλα τα υποχρεωτικά πεδία', true);
            return;
        }

        if (editingProject) {
            const updated = { ...editingProject, ...projectForm };
            await ipcRenderer.invoke('update-project', updated);
            showToast(`Το project "${projectForm.name}" ενημερώθηκε`);
            await loadProjects();
        } else {
            await ipcRenderer.invoke('add-project', projectForm);
            showToast(`Project "${projectForm.name}" προστέθηκε!`);
            await loadProjects();
        }
        setShowProjectModal(false);
    };

    const handleDeleteProject = async (project) => {
        const result = await ipcRenderer.invoke('remove-project', project.id);
        if (result.success) {
            showToast(`Project "${project.name}" διαγράφηκε`);
            setDeleteProjectModal(null);
            await loadProjects();
        } else {
            showToast(result.error, true);
            setDeleteProjectModal(null);
        }
    };

    // ── Backup ops ──
    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 4000);
    };

    const handleBackup = async () => {
        setIsLoading(true);
        setBackupStatus('Εκκίνηση...');
        const result = await ipcRenderer.invoke('create-backup');
        setIsLoading(false);
        setBackupStatus('');
        if (result.success) {
            showToast(`Δημιουργήθηκε: ${result.backupName}`);
            refreshBackups();
        } else {
            showToast(`Σφάλμα: ${result.error}`, true);
        }
    };

    const handleDeleteClick = () => { if (selectedBackup) setDeleteModal(selectedBackup); };

    const handleDeleteConfirm = async () => {
        if (!deleteModal) return;
        const result = await ipcRenderer.invoke('delete-backup', deleteModal.path);
        if (result.success) {
            showToast('Το backup διαγράφηκε');
            setSelectedBackup(null);
            refreshBackups();
        } else {
            showToast(result.error?.includes('EBUSY')
                ? 'Σφάλμα: Το αρχείο είναι σε χρήση. Παύστε το sync του Dropbox και δοκιμάστε ξανά.'
                : `Σφάλμα: ${result.error}`, true);
        }
        setDeleteModal(null);
    };

    const handleOpenFolder = async () => {
        if (selectedBackup) await ipcRenderer.invoke('open-folder', selectedBackup.path);
    };

    const handleCompare = async () => {
        if (!diffBackup1 || !diffBackup2) return;
        setIsLoading(true);
        const result = await ipcRenderer.invoke('get-diff', diffBackup1, diffBackup2);
        setIsLoading(false);
        if (result.success) setDiffResults(result.diffs);
    };

    const handleFileClick = async (file) => {
        if (file.status !== 'modified') return;
        const result = await ipcRenderer.invoke('get-file-diff', diffBackup1, diffBackup2, file.file);
        if (result.success) setSelectedFileDiff({ file: file.file, changes: result.changes, status: file.status });
    };

    const getDiffStats = () => {
        if (!diffResults) return { added: 0, modified: 0, deleted: 0 };
        return {
            added:    diffResults.filter(d => d.status === 'added').length,
            modified: diffResults.filter(d => d.status === 'modified').length,
            deleted:  diffResults.filter(d => d.status === 'deleted').length
        };
    };

    const groupedBackups = React.useMemo(() => {
        const groups = {};
        backups.forEach(backup => {
            const month = backup.monthDisplay || backup.monthFolder || 'Άλλα';
            if (!groups[month]) groups[month] = [];
            groups[month].push(backup);
        });
        return groups;
    }, [backups]);

    const stats = getDiffStats();
    const activeProject = projects.find(p => p.id === activeProjectId);

    const handleWindowControl = async (action) => {
        await ipcRenderer.invoke(`window-${action}`);
        if (action === 'maximize') setIsMaximized(prev => !prev);
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Titlebar */}
            <div className="titlebar">
                <div className="titlebar-left">
                    <div className="titlebar-icon"><Icons.Bolt /></div>
                    <span className="titlebar-title">Backup Studio</span>
                </div>
                <div className="titlebar-controls">
                    <button className="titlebar-btn" onClick={() => handleWindowControl('minimize')}><Icons.Minimize /></button>
                    <button className="titlebar-btn" onClick={() => handleWindowControl('maximize')}>{isMaximized ? <Icons.Restore /> : <Icons.Maximize />}</button>
                    <button className="titlebar-btn close" onClick={() => handleWindowControl('close')}><Icons.Close /></button>
                </div>
            </div>

            <div className="app-wrapper">
                {/* ── Sidebar ── */}
                <div className="sidebar">
                    <div className="sidebar-header">
                        <div className="brand">
                            <div className="brand-icon"><Icons.Bolt /></div>
                            <div className="brand-text">
                                <h1>Backup Studio</h1>
                                <span>MakeYourLifeEasier</span>
                            </div>
                        </div>

                        {/* Dropbox Status Pill */}
                        {dropboxStatus.found !== null && (
                            <div className={`dropbox-pill ${dropboxStatus.found && dropboxStatus.running ? 'ok' : dropboxStatus.found ? 'warn' : 'err'}`}>
                                <span className="dropbox-pill-dot"></span>
                                <span className="dropbox-pill-label">
                                    {!dropboxStatus.found && 'Dropbox: Δεν βρέθηκε'}
                                    {dropboxStatus.found && !dropboxStatus.running && 'Dropbox: Σταματημένο'}
                                    {dropboxStatus.found && dropboxStatus.running && 'Dropbox: Online'}
                                </span>
                                {dropboxStatus.found && !dropboxStatus.running ? (
                                    <button className="dropbox-pill-launch" onClick={launchDropbox} title="Εκκίνηση Dropbox">
                                        <Icons.Rocket />
                                    </button>
                                ) : (
                                    <button className="dropbox-pill-refresh" onClick={checkDropbox} title="Refresh">
                                        <Icons.ArrowRight />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Project Switcher */}
                        <div className="project-switcher-wrapper" onClick={e => e.stopPropagation()}>
                            <div className="project-switcher-row">
                                <button
                                    className="project-switcher-btn"
                                    onClick={() => setShowProjectsDropdown(prev => !prev)}
                                >
                                    <div className="project-switcher-dot"></div>
                                    <span className="project-switcher-name">{activeProject?.name || 'Επιλογή project'}</span>
                                    <span className="project-switcher-chevron"><Icons.ChevronDown /></span>
                                </button>
                                <button className="project-add-btn" title="Νέο project" onClick={openAddProjectModal}>
                                    <Icons.Plus />
                                </button>
                            </div>

                            {showProjectsDropdown && (
                                <div className="project-dropdown">
                                    {projects.map(p => (
                                        <div
                                            key={p.id}
                                            className={`project-dropdown-item ${p.id === activeProjectId ? 'active' : ''}`}
                                        >
                                            <span
                                                className="project-dropdown-name"
                                                onClick={() => switchProject(p.id)}
                                            >
                                                {p.id === activeProjectId && <span className="project-active-dot">●</span>}
                                                {p.name}
                                            </span>
                                            <div className="project-dropdown-actions">
                                                <button
                                                    className="project-icon-btn"
                                                    title="Επεξεργασία"
                                                    onClick={() => openEditProjectModal(p)}
                                                ><Icons.Edit /></button>
                                                {projects.length > 1 && (
                                                    <button
                                                        className="project-icon-btn danger"
                                                        title="Διαγραφή"
                                                        onClick={() => { setDeleteProjectModal(p); setShowProjectsDropdown(false); }}
                                                    ><Icons.Trash /></button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="project-dropdown-divider"></div>
                                    <button className="project-dropdown-add" onClick={() => { openAddProjectModal(); setShowProjectsDropdown(false); }}>
                                        <Icons.Plus /> Νέο project
                                    </button>
                                </div>
                            )}
                        </div>

                        <button className={`backup-btn ${isLoading ? 'loading' : ''}`} onClick={handleBackup} disabled={isLoading}>
                            {isLoading
                                ? (<><div className="spinner"></div><span>{backupStatus}</span></>)
                                : (<><Icons.Rocket /><span>Δημιουργία Backup</span></>)}
                        </button>
                    </div>

                    <div className="stats-row">
                        <div className="stat-box">
                            <div className="stat-value blue">{backups.length}</div>
                            <div className="stat-label">Σύνολο</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-value emerald">V{backups[0]?.version || 0}</div>
                            <div className="stat-label">Τελευταίο</div>
                        </div>
                    </div>

                    <div className="backup-list-section">
                        <div className="list-header"><Icons.History /><span>Ιστορικό</span></div>
                        <div className="backup-list">
                            {Object.entries(groupedBackups).map(([month, monthBackups]) => (
                                <div key={month} className="month-group">
                                    <div className="month-label"><Icons.Calendar />{month}</div>
                                    {monthBackups.map(backup => (
                                        <div
                                            key={backup.name}
                                            className={`backup-item ${selectedBackup?.name === backup.name ? 'selected' : ''}`}
                                            onClick={() => setSelectedBackup(backup)}
                                        >
                                            <div className="backup-item-row">
                                                <span className="day-tag">D{backup.day}</span>
                                                <span className="version-tag">V{backup.version}</span>
                                            </div>
                                            <div className="backup-meta">
                                                <span><Icons.Clock /> {backup.date}</span>
                                                <span><Icons.HardDrive /> {backup.size}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Main content ── */}
                <div className="main-content">
                    <div className="content-header">
                        <div className="header-info">
                            <h2>{selectedBackup ? selectedBackup.name : 'Επιλέξτε backup'}</h2>
                            <p>{selectedBackup ? `Δημιουργήθηκε: ${selectedBackup.date}` : 'Επιλέξτε από το ιστορικό ή δημιουργήστε νέο'}</p>
                        </div>
                        <div className="tabs-container">
                            <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}><Icons.Info />Πληροφορίες</button>
                            <button className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`} onClick={() => setActiveTab('diff')}><Icons.GitCompare />Σύγκριση</button>
                        </div>
                        {selectedBackup && (
                            <div className="actions">
                                <button className="action-btn" onClick={handleOpenFolder} title="Άνοιγμα φακέλου"><Icons.FolderOpen /></button>
                                <button className="action-btn danger" onClick={handleDeleteClick} title="Διαγραφή"><Icons.Trash /></button>
                            </div>
                        )}
                    </div>

                    <div className="content-body">
                        {activeTab === 'info' && selectedBackup && (
                            <div className="info-grid">
                                {selectedBackup.isMigrated && (
                                    <div className="info-card wide warning-card">
                                        <div className="info-card-icon amber"><Icons.AlertTriangle /></div>
                                        <div className="info-card-label">Προειδοποίηση</div>
                                        <div className="info-card-value" style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.5' }}>
                                            Αυτό το backup δημιουργήθηκε πριν την ενημέρωση του συστήματος metadata. Η ημερομηνία βασίζεται στα στοιχεία του αρχείου.
                                        </div>
                                    </div>
                                )}
                                <div className="info-card"><div className="info-card-icon emerald"><Icons.Calendar /></div><div className="info-card-label">Ημέρα</div><div className="info-card-value">Day {selectedBackup.day}</div></div>
                                <div className="info-card"><div className="info-card-icon blue"><Icons.Tag /></div><div className="info-card-label">Έκδοση</div><div className="info-card-value">Version {selectedBackup.version}</div></div>
                                <div className="info-card"><div className="info-card-icon amber"><Icons.HardDrive /></div><div className="info-card-label">Μέγεθος</div><div className="info-card-value">{selectedBackup.size}</div></div>
                                <div className="info-card"><div className="info-card-icon violet"><Icons.Clock /></div><div className="info-card-label">Δημιουργήθηκε</div><div className="info-card-value">{selectedBackup.date}</div></div>
                                <div className="info-card wide"><div className="info-card-icon blue"><Icons.Folder /></div><div className="info-card-label">Διαδρομή</div><div className="info-card-value mono">{selectedBackup.path}</div></div>
                            </div>
                        )}

                        {activeTab === 'diff' && (
                            <div className="diff-wrapper">
                                <div className="diff-selector-card">
                                    <div className="select-group">
                                        <div className="select-label"><Icons.Clock />Παλιά Έκδοση</div>
                                        <select className="select-input" value={diffBackup1} onChange={e => setDiffBackup1(e.target.value)}>
                                            <option value="">Επιλογή...</option>
                                            {backups.map(b => (<option key={b.path} value={b.path}>{b.name}</option>))}
                                        </select>
                                    </div>
                                    <div className="diff-arrow"><Icons.ArrowRight /></div>
                                    <div className="select-group">
                                        <div className="select-label"><Icons.Sparkles />Νέα Έκδοση</div>
                                        <select className="select-input" value={diffBackup2} onChange={e => setDiffBackup2(e.target.value)}>
                                            <option value="">Επιλογή...</option>
                                            {backups.map(b => (<option key={b.path} value={b.path}>{b.name}</option>))}
                                        </select>
                                    </div>
                                    <button className="compare-btn" onClick={handleCompare}><Icons.Search />Σύγκριση</button>
                                </div>
                                {diffResults && (
                                    <>
                                        <div className="diff-stats">
                                            <div className="diff-stat-card added"><div className="diff-stat-value">{stats.added}</div><div className="diff-stat-label">Νέα Αρχεία</div></div>
                                            <div className="diff-stat-card modified"><div className="diff-stat-value">{stats.modified}</div><div className="diff-stat-label">Τροποποιημένα</div></div>
                                            <div className="diff-stat-card deleted"><div className="diff-stat-value">{stats.deleted}</div><div className="diff-stat-label">Διαγραμμένα</div></div>
                                        </div>
                                        <div className="file-list-card">
                                            <div className="file-list-header">
                                                <div className="file-list-title"><Icons.FileCode />Αρχεία με Αλλαγές</div>
                                                <div className="file-count-badge">{diffResults.length} αρχεία</div>
                                            </div>
                                            <div className="file-list">
                                                {diffResults.length === 0
                                                    ? (<div className="empty-state"><div className="empty-state-icon"><Icons.Check /></div><div className="empty-state-title">Καμία Αλλαγή</div><div className="empty-state-text">Τα backups είναι πανομοιότυπα</div></div>)
                                                    : diffResults.map((file, idx) => (
                                                        <div key={idx} className={`file-item ${file.status === 'modified' ? 'clickable' : ''}`} onClick={() => handleFileClick(file)}>
                                                            <div className={`file-status-indicator ${file.status}`}></div>
                                                            <div className="file-path">{file.file}</div>
                                                            <span className={`file-status-badge ${file.status}`}>
                                                                {file.status === 'added' && 'ΝΕΟ'}
                                                                {file.status === 'modified' && 'ΤΡΟΠΟΠΟΙΗΜΕΝΟ'}
                                                                {file.status === 'deleted' && 'ΔΙΑΓΡΑΜΜΕΝΟ'}
                                                            </span>
                                                            {file.status === 'modified' && (<div className="file-arrow"><Icons.ChevronRight /></div>)}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {!selectedBackup && activeTab === 'info' && (
                            <div className="empty-state">
                                <div className="empty-state-icon"><Icons.Package /></div>
                                <div className="empty-state-title">Κανένα Backup Επιλεγμένο</div>
                                <div className="empty-state-text">Επιλέξτε ένα backup από την λίστα ή δημιουργήστε νέο</div>
                            </div>
                        )}
                    </div>

                    <div className="footer-bar">
                        <div className="path-info"><span className="path-label">SOURCE:</span><span>{paths.source}</span></div>
                        <div className="path-info"><span className="path-label">DEST:</span><span>{paths.dest}</span></div>
                    </div>
                </div>
            </div>

            {/* ── File diff modal ── */}
            {selectedFileDiff && (
                <div className="modal-overlay" onClick={() => setSelectedFileDiff(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-row">
                                <div className="modal-title">{selectedFileDiff.file}</div>
                                <span className={`file-status-badge ${selectedFileDiff.status}`}>{selectedFileDiff.status.toUpperCase()}</span>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedFileDiff(null)}><Icons.Close /></button>
                        </div>
                        <div className="modal-body">
                            {selectedFileDiff.changes.map((change, idx) => (
                                <div key={idx} className={`diff-line ${change.added ? 'added' : ''} ${change.removed ? 'removed' : ''} ${change.omitted ? 'context-gap' : ''}`}>
                                    <div className="diff-line-num">{idx + 1}</div>
                                    <div className="diff-line-content">{change.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete backup modal ── */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-body">
                            <div className="delete-icon-wrapper"><Icons.AlertTriangle /></div>
                            <div className="delete-title">Διαγραφή Backup</div>
                            <div className="delete-message">Είστε σίγουροι; Η ενέργεια δεν μπορεί να αναιρεθεί.</div>
                            <div className="delete-backup-name">{deleteModal.name}</div>
                            <div className="delete-actions">
                                <button className="btn btn-cancel" onClick={() => setDeleteModal(null)}><Icons.Close />Ακύρωση</button>
                                <button className="btn btn-danger" onClick={handleDeleteConfirm}><Icons.Trash />Διαγραφή</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete PROJECT modal ── */}
            {deleteProjectModal && (
                <div className="modal-overlay" onClick={() => setDeleteProjectModal(null)}>
                    <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-body">
                            <div className="delete-icon-wrapper"><Icons.AlertTriangle /></div>
                            <div className="delete-title">Διαγραφή Project</div>
                            <div className="delete-message">Θα διαγραφεί μόνο η ρύθμιση. Τα backup αρχεία σου παραμένουν στο δίσκο.</div>
                            <div className="delete-backup-name">{deleteProjectModal.name}</div>
                            <div className="delete-actions">
                                <button className="btn btn-cancel" onClick={() => setDeleteProjectModal(null)}><Icons.Close />Ακύρωση</button>
                                <button className="btn btn-danger" onClick={() => handleDeleteProject(deleteProjectModal)}><Icons.Trash />Διαγραφή</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Project Modal ── */}
            {showProjectModal && (
                <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
                    <div className="modal project-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-row">
                                <div className="modal-title">{editingProject ? 'Επεξεργασία Project' : 'Νέο Project'}</div>
                            </div>
                            <button className="modal-close" onClick={() => setShowProjectModal(false)}><Icons.Close /></button>
                        </div>
                        <div className="modal-body project-form">

                            {/* Dropbox status inside modal */}
                            <div className={`modal-dropbox-banner ${
                                dropboxStatus.found && dropboxStatus.running ? 'ok'
                                : dropboxStatus.found ? 'warn' : 'err'
                            }`}>
                                <span className="modal-dropbox-dot"></span>
                                <div className="modal-dropbox-text">
                                    {!dropboxStatus.found && (
                                        <><strong>Dropbox δεν βρέθηκε</strong><span>Η εφαρμογή χρησιμοποιεί το Dropbox για τα backups. Εγκατάστησέ το πρώτα.</span></>
                                    )}
                                    {dropboxStatus.found && !dropboxStatus.running && (
                                        <><strong>Dropbox σταματημένο</strong><span>Τα backups θα γίνουν στο: <code>{dropboxStatus.path}\Projects Backup\{projectForm.appName || '{AppName}'}</code></span></>
                                    )}
                                    {dropboxStatus.found && dropboxStatus.running && (
                                        <><strong>Dropbox Online ✓</strong><span>Backups → <code>{dropboxStatus.path}\Projects Backup\{projectForm.appName || '{AppName}'}</code></span></>
                                    )}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="form-group">
                                <label className="form-label">Όνομα <span className="required">*</span></label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="π.χ. My Awesome App"
                                    value={projectForm.name}
                                    onChange={e => {
                                        const name = e.target.value;
                                        // Auto-generate appName: remove spaces & special chars
                                        const autoAppName = name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_\-\.]/g, '');
                                        setProjectForm(p => ({
                                            ...p,
                                            name,
                                            // Only auto-fill if user hasn't manually edited appName
                                            appName: p._appNameManuallyEdited ? p.appName : autoAppName
                                        }));
                                    }}
                                />
                            </div>

                            {/* App Name (prefix) - auto + info tooltip */}
                            <div className="form-group">
                                <label className="form-label">
                                    App Name
                                    <span className="info-tooltip-wrapper">
                                        <span className="info-icon">?</span>
                                        <span className="info-popout">
                                            <strong>Τι είναι το App Name;</strong>
                                            Είναι το prefix που χρησιμοποιείται για να ονομαστούν οι φάκελοι των backups σου.
                                            <br/><br/>
                                            <span className="info-example">MyApp → MyApp_D5_V3</span>
                                            <br/>
                                            <span className="info-sub">D5 = 5η του μήνα &nbsp;·&nbsp; V3 = Version 3</span>
                                        </span>
                                    </span>
                                </label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Συμπληρώνεται αυτόματα από το Όνομα"
                                    value={projectForm.appName}
                                    onChange={e => setProjectForm(p => ({ ...p, appName: e.target.value, _appNameManuallyEdited: true }))}
                                />
                            </div>

                            {/* Source path */}
                            <div className="form-group">
                                <label className="form-label">Source Path (φάκελος project) <span className="required">*</span></label>
                                <div className="path-input-row">
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="D:\Projects\MyApp"
                                        value={projectForm.sourcePath}
                                        onChange={e => setProjectForm(p => ({ ...p, sourcePath: e.target.value }))}
                                    />
                                    <button className="browse-btn" onClick={() => handleBrowseFolder('sourcePath')}>
                                        <Icons.Folder /> Browse
                                    </button>
                                </div>
                            </div>

                            {/* App Exe */}
                            <div className="form-group">
                                <label className="form-label">App Executable <span className="optional">(προαιρετικό — κλείνει την εφαρμογή πριν το backup)</span></label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="π.χ. MyApp.exe"
                                    value={projectForm.appExe}
                                    onChange={e => setProjectForm(p => ({ ...p, appExe: e.target.value }))}
                                />
                            </div>

                            <div className="form-actions">
                                <button className="btn btn-cancel" onClick={() => setShowProjectModal(false)}><Icons.Close />Ακύρωση</button>
                                <button className="btn btn-primary" onClick={handleSaveProject}>
                                    <Icons.Check />{editingProject ? 'Αποθήκευση' : 'Προσθήκη'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`toast ${toast.isError ? 'error' : ''}`}>
                    {toast.isError ? <Icons.AlertCircle /> : <Icons.Check />}
                    {toast.message}
                </div>
            )}
        </>
    );
}

// Cache root to avoid createRoot() duplicate warning
if (!window.__reactRoot) {
    window.__reactRoot = ReactDOM.createRoot(document.getElementById('root'));
}
window.__reactRoot.render(<App />);
