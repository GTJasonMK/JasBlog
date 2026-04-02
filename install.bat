@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "RUN_DIR=.run"
set "LOCK_FILE=%RUN_DIR%\install.lock"
set "DEPS_HASH_FILE=%RUN_DIR%\deps.hash"
set "EXIT_CODE=0"
set "HASH_SOURCE_FILE="
set "CURRENT_HASH="
set "SAVED_HASH="

pushd "%SCRIPT_DIR%" >nul 2>nul
if errorlevel 1 (
  echo ERROR: Could not enter script directory.
  exit /b 1
)

if not exist "%RUN_DIR%" (
  mkdir "%RUN_DIR%" >nul 2>nul
)

if exist "%LOCK_FILE%" (
  echo ERROR: Install lock exists. Another install may be running.
  set "EXIT_CODE=1"
  goto :cleanup
)

> "%LOCK_FILE%" (
  echo install_lock=1
  echo started=%DATE% %TIME%
)

call :require_cmd node || goto :failed
call :require_cmd npm || goto :failed
call :require_cmd powershell || goto :failed

if not exist "package.json" (
  echo ERROR: package.json was not found in repository root.
  goto :failed
)

call :select_hash_source
call :compute_hash "%HASH_SOURCE_FILE%" CURRENT_HASH
if errorlevel 1 (
  echo WARN: Could not compute dependency hash. Running full install.
  set "CURRENT_HASH="
)

if defined CURRENT_HASH if exist "%DEPS_HASH_FILE%" (
  set /p SAVED_HASH=<"%DEPS_HASH_FILE%"
)

if defined CURRENT_HASH if defined SAVED_HASH (
  if /i "!CURRENT_HASH!"=="!SAVED_HASH!" if exist "node_modules\.bin\next.cmd" (
    echo INFO: Dependencies are already up to date.
    goto :cleanup
  )
)

if exist "package-lock.json" (
  echo INFO: Running npm ci...
  call npm ci
) else (
  echo INFO: package-lock.json not found, running npm install...
  call npm install
)

if errorlevel 1 (
  echo ERROR: Dependency installation failed.
  goto :failed
)

if not exist "node_modules\.bin\next.cmd" (
  echo ERROR: next executable was not found after installation.
  goto :failed
)

if defined CURRENT_HASH (
  > "%DEPS_HASH_FILE%" echo !CURRENT_HASH!
)

echo INFO: Installation completed successfully.
goto :cleanup

:failed
set "EXIT_CODE=1"

:cleanup
if exist "%LOCK_FILE%" (
  del /f /q "%LOCK_FILE%" >nul 2>nul
)
if exist "%RUN_DIR%\install.tmp" (
  del /f /q "%RUN_DIR%\install.tmp" >nul 2>nul
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

:select_hash_source
if exist "package-lock.json" (
  set "HASH_SOURCE_FILE=package-lock.json"
) else (
  set "HASH_SOURCE_FILE=package.json"
)
exit /b 0

:compute_hash
set "%~2="
for /f "usebackq delims=" %%H in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-FileHash -Path '%~1' -Algorithm SHA256).Hash"`) do (
  set "%~2=%%H"
)

if not defined %~2 (
  exit /b 1
)
exit /b 0
