!macro customInit
  # For one-click installer, we define the installation directory
  # The product name will be appended automatically by electron-builder
  StrCpy $INSTDIR "$PROGRAMFILES64\ThomasThanos\Backup-projects"
!macroend

!macro customInstall
  # Create parent directory
  CreateDirectory "$PROGRAMFILES64\ThomasThanos"
  
  # Create desktop shortcut (exe is now named Backup-projects.exe)
  CreateShortCut "$DESKTOP\Project Backup.lnk" "$INSTDIR\Backup-projects.exe" "" "$INSTDIR\Backup-projects.exe" 0

  # Create start menu shortcut
  CreateShortCut "$SMPROGRAMS\Project Backup.lnk" "$INSTDIR\Backup-projects.exe" "" "$INSTDIR\Backup-projects.exe" 0
  
  # Pin to taskbar (Windows 10+)
  nsExec::ExecToLog '"$SYSDIR\explorer.exe" shell:::{4234d49b-0245-4df3-b780-3893943456e1} /p:"$INSTDIR\Backup-projects.exe"'
!macroend

!macro customUnInstall
  # Remove desktop shortcut
  Delete "$DESKTOP\Project Backup.lnk"

  # Remove start menu shortcut
  Delete "$SMPROGRAMS\Project Backup.lnk"

  # Unpin from taskbar
  nsExec::ExecToLog '"$SYSDIR\explorer.exe" shell:::{4234d49b-0245-4df3-b780-3893943456e1} /u:"$INSTDIR\Backup-projects.exe"'
  
  # Try to remove parent folder if empty
  RMDir "$PROGRAMFILES64\ThomasThanos"
!macroend