@echo off
setlocal
set "ROOT=%~dp0"
where node >nul 2>&1
if %errorlevel%==0 (
  node "%ROOT%scripts\repair-build-source.mjs"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=Join-Path '%ROOT%' 'game7.js'; $s=[IO.File]::ReadAllText($p); $s=$s.Replace(\"})$(s+'Label')\",\"});$(s+'Label')\"); [IO.File]::WriteAllText($p,$s)"
)
start "Bible Fighter Playtest" "%ROOT%playtest.html"
endlocal
