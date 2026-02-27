!include "StrFunc.nsh"
${StrRep}
${StrStr}

; ============================================================================
; NSIS OPTIMIZATIONS
; ============================================================================
SetCompressor /SOLID lzma
SetCompressorDictSize 32
SetDatablockOptimize on
AutoCloseWindow true


; ============================================================================
; SECURITY HELPERS
; ============================================================================

; Επαληθεύει αν ένα path είναι ασφαλές (μόνο Program Files)
!macro ValidateUninstallerPath _PATH _RESULT
  Push "${_PATH}"
  Call ValidateUninstallerPathFunc
  Pop ${_RESULT}
!macroend

Function ValidateUninstallerPathFunc
  Exch $0  ; Path to validate
  Push $1
  Push $2

  ; Convert to lowercase για σύγκριση
  System::Call 'kernel32::CharLowerA(t r0) t .r0'

  ; Έλεγχος αν το path αρχίζει με ασφαλείς τοποθεσίες (Program Files 32/64)
  StrCpy $2 $0 15
  StrCmp $2 "c:\program file" valid_path

  ; Μη έγκυρο path
  StrCpy $1 "0"
  Goto done

  valid_path:
  ; Έλεγχος ότι το αρχείο τελειώνει σε .exe
  StrCpy $2 $0 "" -4
  StrCmp $2 ".exe" 0 invalid_path
  StrCpy $1 "1"
  Goto done

  invalid_path:
  StrCpy $1 "0"

  done:
  Pop $2
  Exch $1
  Exch
  Pop $0
FunctionEnd


; ============================================================================
; customInit - Runs BEFORE installation
; ============================================================================
!macro customInit
  ; Ορισμός installation directory (Program Files - απαιτεί admin)
  StrCpy $INSTDIR "$PROGRAMFILES64\ThomasThanos\Backup-projects"

  ; ── ΑΥΤΟΜΑΤΟΣ ΕΛΕΓΧΟΣ: Αν είναι ήδη εγκατεστημένο το ίδιο version → skip ──
  ReadRegStr $R9 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayVersion"
  ${If} $R9 == "${VERSION}"
    ; Ακριβώς ίδια έκδοση είναι ήδη εγκατεστημένη — δεν χρειάζεται επανεγκατάσταση
    MessageBox MB_ICONINFORMATION|MB_OK "Η έκδοση ${VERSION} είναι ήδη εγκατεστημένη.$\nΔεν απαιτείται επανεγκατάσταση."
    Abort
  ${EndIf}

  ; ── ΕΛΕΓΧΟΣ ΑΝ Η ΕΦΑΡΜΟΓΗ ΤΡΕΧΕΙ ──
  nsExec::ExecToStack 'wmic process where "name='\''Backup-projects.exe'\''" get ProcessId /FORMAT:LIST'
  Pop $0  ; Exit code
  Pop $1  ; Output

  ${If} $0 == 0
    ${StrStr} $2 $1 "ProcessId="
    ${If} $2 != ""
      ; Βρέθηκε process — περίμενε μέχρι να κλείσει (max ~1.5 δευτερόλεπτα)
      StrCpy $0 0
      wait_for_exit:
        FindWindow $3 "" "Backup-projects"
        ${If} $3 == 0
          Goto process_exited
        ${EndIf}
        IntOp $0 $0 + 1
        IntCmp $0 5 process_exited  ; 5 × 250ms = 1.25 sec
        Sleep 250
        Goto wait_for_exit
    ${EndIf}
  ${EndIf}

  process_exited:

  ; ── ΚΑΘΑΡΙΣΜΟΣ ΠΡΟΗΓΟΥΜΕΝΗΣ ΕΓΚΑΤΑΣΤΑΣΗΣ ──

  ; Έλεγχος legacy registry key
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Backup-projects" "UninstallString"
  StrCmp $R0 "" check_guid found_known_key

  check_guid:
  ; Έλεγχος για electron-builder GUID key
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "UninstallString"
  StrCmp $R0 "" scan_registry found_known_key

  found_known_key:
  ${StrRep} $R0 $R0 '"' ''

  !insertmacro ValidateUninstallerPath $R0 $R1
  ${If} $R1 == "1"
  ${AndIf} ${FileExists} "$R0"
    ExecWait '"$R0" /S _?=$INSTDIR'
  ${Else}
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Backup-projects"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
  ${EndIf}
  Goto done_scanning

  scan_registry:
  ; Σάρωση για orphaned registry entries (corrupted installations)
  StrCpy $0 0

  loop_registry:
  EnumRegKey $1 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall" $0
  StrCmp $1 "" done_scanning

  ReadRegStr $2 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$1" "DisplayName"
  StrCmp $2 "" next_key

  StrCmp $2 "Backup-projects" found_orphan
  ${StrStr} $3 $2 "Backup-projects "
  StrCmp $3 "" next_key found_orphan

  found_orphan:
  ReadRegStr $4 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$1" "UninstallString"
  ${StrRep} $4 $4 '"' ''

  !insertmacro ValidateUninstallerPath $4 $R2
  ${If} $R2 == "1"
  ${AndIf} ${FileExists} "$4"
    ExecWait '"$4" /S _?=$INSTDIR'
  ${EndIf}

  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$1"
  IntOp $0 $0 - 1  ; Registry shifted — ξαναέλεγξε το ίδιο index

  next_key:
  IntOp $0 $0 + 1
  Goto loop_registry

  done_scanning:
!macroend


; ============================================================================
; customInstall - Runs AFTER files are installed
; ============================================================================
!macro customInstall
  ; Δημιουργία parent directory
  CreateDirectory "$PROGRAMFILES64\ThomasThanos"

  ; Desktop & Start Menu shortcuts
  CreateShortCut "$DESKTOP\Project Backup.lnk" "$INSTDIR\Backup-projects.exe" "" "$INSTDIR\Backup-projects.exe" 0
  CreateShortCut "$SMPROGRAMS\Project Backup.lnk" "$INSTDIR\Backup-projects.exe" "" "$INSTDIR\Backup-projects.exe" 0

  ; Χρήση του electron-builder generated key για όλα τα registry entries
  StrCpy $R0 "${UNINSTALL_APP_KEY}"

  ; Εγγραφή πληροφοριών εφαρμογής στο registry (HKLM - machine-wide, απαιτεί admin)
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R0" "DisplayName" "Backup-projects ${VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R0" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R0" "Publisher" "ThomasThanos"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R0" "DisplayIcon" "$INSTDIR\Backup-projects.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R0" "HelpLink" "https://github.com/ThomasThanos/backup_projects"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R0" "URLInfoAbout" "https://github.com/ThomasThanos/backup_projects"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R0" "Comments" "Backup Manager for MakeYourLifeEasier - Project file backup & versioning"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R0" "InstallLocation" "$INSTDIR"
  ; Approximate size (~150 MB για Electron app)
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R0" "EstimatedSize" 0x00009600

  ; Legacy key για backwards compatibility
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Backup-projects" "DisplayName" "Backup-projects ${VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Backup-projects" "UninstallString" '"$INSTDIR\Uninstall Backup-projects.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Backup-projects" "DisplayVersion" "${VERSION}"

  ; App Path registration (εμφανίζεται στο Run dialog και "Open With")
  WriteRegStr HKLM "Software\Microsoft\Windows\App Paths\Backup-projects.exe" "" "$INSTDIR\Backup-projects.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\App Paths\Backup-projects.exe" "Path" "$INSTDIR"
!macroend


; ============================================================================
; customUnInstall - Runs during uninstallation
; ============================================================================
!macro customUnInstall
  ; Αφαίρεση shortcuts
  Delete "$DESKTOP\Project Backup.lnk"
  Delete "$SMPROGRAMS\Project Backup.lnk"

  ; Καθαρισμός όλων των registry keys (HKLM)
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Backup-projects"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
  DeleteRegKey HKLM "Software\Microsoft\Windows\App Paths\Backup-projects.exe"

  ; Αφαίρεση app data μόνο σε full uninstall (όχι κατά τη διάρκεια update)
  ; App data path: C:\Users\<username>\AppData\Roaming\ThomasThanos\Backup-projects
  ${ifNot} ${isUpdated}
    ${If} ${FileExists} "$APPDATA\ThomasThanos\Backup-projects\*.*"
      RMDir /r "$APPDATA\ThomasThanos\Backup-projects"
    ${EndIf}
    ; Αν άδειασε ο parent φάκελος ThomasThanos, αφαίρεσέ τον κι αυτόν
    RMDir "$APPDATA\ThomasThanos"
    ; Αφαίρεση parent folder στο Program Files αν είναι άδειος
    RMDir "$PROGRAMFILES64\ThomasThanos"
    SetShellVarContext current
  ${endIf}
!macroend
