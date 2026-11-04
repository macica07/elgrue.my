@echo off
setlocal
title Grue.my - Quartz local

REM Guarda este archivo en la carpeta raiz del repositorio elgrue.my.
cd /d "%~dp0"

if not exist "plugins\grue-infobox\package.json" (
    echo ERROR: No encuentro plugins\grue-infobox\package.json
    echo Coloca este BAT dentro de la carpeta principal elgrue.my.
    pause
    exit /b 1
)

echo ==========================================
echo  Grue.my - vista previa local
echo ==========================================
echo.
echo [1/2] Compilando Grue Infobox...
pushd "plugins\grue-infobox"
call npm.cmd run build
if errorlevel 1 (
    popd
    echo.
    echo ERROR: No se pudo compilar Grue Infobox.
    pause
    exit /b 1
)
popd

echo.
echo [2/2] Iniciando Quartz en http://localhost:8080/
echo Deja esta ventana abierta mientras uses la vista previa.
echo Pulsa Ctrl+C para detener el servidor.
echo.

REM Abre el navegador poco despues de iniciar Quartz.
start "" /min powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 5; Start-Process 'http://localhost:8080/'"

call npx.cmd quartz build --serve
if errorlevel 1 (
    echo.
    echo Quartz termino con un error.
    pause
)
endlocal
