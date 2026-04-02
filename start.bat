@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "RUN_DIR=.run"
set "LOCK_FILE=%RUN_DIR%\start.lock"
set "PORT_FILE=%RUN_DIR%\port.txt"
set "EXIT_CODE=0"
set "SELECTED_PORT="

pushd "%SCRIPT_DIR%" >nul 2>nul
if errorlevel 1 (
  echo ERROR: Could not enter script directory.
  exit /b 1
)

if not exist "%RUN_DIR%" (
  mkdir "%RUN_DIR%" >nul 2>nul
)

call :acquire_start_lock || goto :failed

call :require_cmd node || goto :failed
call :require_cmd npm || goto :failed
call :require_cmd powershell || goto :failed

if not exist "package.json" (
  echo ERROR: package.json was not found in repository root.
  goto :failed
)

call :ensure_dependencies || goto :failed
call :precleanup
call :resolve_port || goto :failed

echo INFO: Starting dev server on http://localhost:!SELECTED_PORT!/
call npm run dev -- --port !SELECTED_PORT!
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo ERROR: Dev server exited with code %EXIT_CODE%.
)

goto :cleanup

:failed
set "EXIT_CODE=1"

:cleanup
call :postcleanup

if exist "%LOCK_FILE%" (
  del /f /q "%LOCK_FILE%" >nul 2>nul
)

set "FINAL_EXIT_CODE=%EXIT_CODE%"
popd >nul 2>nul
endlocal & exit /b %FINAL_EXIT_CODE%

:require_cmd
where %~1 >nul 2>nul
if errorlevel 1 (
  echo ERROR: Required command not found: %~1
  exit /b 1
)
exit /b 0

:acquire_start_lock
if not exist "%LOCK_FILE%" (
  > "%LOCK_FILE%" (
    echo start_lock=1
    echo started=%DATE% %TIME%
  )
  exit /b 0
)

call :is_dev_process_running
if "%ERRORLEVEL%"=="0" (
  echo ERROR: Start lock exists and a dev process is still running.
  exit /b 1
)

echo WARN: Stale start lock detected. Cleaning it up.
del /f /q "%LOCK_FILE%" >nul 2>nul
if exist "%LOCK_FILE%" (
  echo ERROR: Could not remove stale start lock.
  exit /b 1
)

> "%LOCK_FILE%" (
  echo start_lock=1
  echo started=%DATE% %TIME%
)
exit /b 0

:is_dev_process_running
powershell -NoProfile -ExecutionPolicy Bypass -Command "$repo = (Resolve-Path '.').Path; $procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -and $_.CommandLine -match 'next' -and $_.CommandLine -match 'dev' -and $_.CommandLine -match [regex]::Escape($repo) }; if ($procs) { exit 0 } else { exit 1 }"
if errorlevel 1 (
  exit /b 1
)
exit /b 0

:ensure_dependencies
echo INFO: Verifying dependencies with install.bat...
call "%SCRIPT_DIR%install.bat"
if errorlevel 1 exit /b 1

if not exist "node_modules\.bin\next.cmd" (
  echo ERROR: Dependency check failed after install.
  exit /b 1
)

exit /b 0

:precleanup
if exist ".next" (
  echo INFO: Cleaning .next directory...
  rmdir /s /q ".next" >nul 2>nul
)

if exist "%PORT_FILE%" del /f /q "%PORT_FILE%" >nul 2>nul
if exist "%RUN_DIR%\dev.pid" del /f /q "%RUN_DIR%\dev.pid" >nul 2>nul
if exist "%RUN_DIR%\start.log" del /f /q "%RUN_DIR%\start.log" >nul 2>nul
if exist "%RUN_DIR%\start.tmp" del /f /q "%RUN_DIR%\start.tmp" >nul 2>nul

del /f /q "npm-debug.log" "npm-debug.log.*" >nul 2>nul
exit /b 0

:postcleanup
if exist "%PORT_FILE%" del /f /q "%PORT_FILE%" >nul 2>nul
if exist "%RUN_DIR%\dev.pid" del /f /q "%RUN_DIR%\dev.pid" >nul 2>nul
if exist "%RUN_DIR%\start.log" del /f /q "%RUN_DIR%\start.log" >nul 2>nul
if exist "%RUN_DIR%\start.tmp" del /f /q "%RUN_DIR%\start.tmp" >nul 2>nul
exit /b 0

:resolve_port
set "SELECTED_PORT="

if defined PORT (
  set "CANDIDATE_PORT=%PORT%"
  call :is_valid_port "!CANDIDATE_PORT!"
  if errorlevel 1 (
    echo WARN: Ignoring invalid PORT value "%PORT%".
  ) else (
    call :is_reserved_port "!CANDIDATE_PORT!"
    set "RESERVED_CHECK=!ERRORLEVEL!"

    if "!RESERVED_CHECK!"=="0" (
      echo WARN: PORT !CANDIDATE_PORT! is reserved by Next.js. Falling back to an auto-detected port.
    ) else (
      if "!RESERVED_CHECK!"=="2" (
        echo WARN: Could not validate reserved-port rules. Falling back to an auto-detected port.
      ) else (
        call :is_port_available "!CANDIDATE_PORT!"
        if errorlevel 1 (
          echo WARN: PORT !CANDIDATE_PORT! is not available. Falling back to an auto-detected port.
        ) else (
          set "SELECTED_PORT=!CANDIDATE_PORT!"
        )
      )
    )
  )
)

if not defined SELECTED_PORT (
  call :detect_available_port || exit /b 1
)

if not defined SELECTED_PORT (
  echo ERROR: Port detection returned no value.
  exit /b 1
)

> "%PORT_FILE%" (
  echo !SELECTED_PORT!
)

echo INFO: Selected port !SELECTED_PORT!
exit /b 0

:is_valid_port
powershell -NoProfile -ExecutionPolicy Bypass -Command "$candidate = 0; if (-not [int]::TryParse('%~1', [ref]$candidate)) { exit 1 }; if ($candidate -lt 1 -or $candidate -gt 65535) { exit 1 }; exit 0"
if errorlevel 1 exit /b 1
exit /b 0

:is_reserved_port
node -e "const port = Number(process.argv[1]); if (Number.isInteger(port) === false) process.exit(2); try { const helper = require('next/dist/lib/helpers/get-reserved-port'); process.exit(helper.isPortIsReserved(port) ? 0 : 1); } catch (_) { process.exit(2); }" %~1
exit /b %ERRORLEVEL%

:is_port_available
powershell -NoProfile -ExecutionPolicy Bypass -Command "$listener = $null; try { $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, [int]'%~1'); $listener.Start(); exit 0 } catch { exit 1 } finally { if ($listener) { $listener.Stop() } }"
if errorlevel 1 exit /b 1
exit /b 0

:detect_available_port
set "SELECTED_PORT="
for /f %%P in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0); $listener.Start(); $port = $listener.LocalEndpoint.Port; $listener.Stop(); Write-Output $port"') do set "SELECTED_PORT=%%P"
if not defined SELECTED_PORT (
  echo ERROR: Failed to detect an available port.
  exit /b 1
)
exit /b 0

