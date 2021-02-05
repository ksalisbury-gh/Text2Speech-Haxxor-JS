@echo off
title Text2Speech-Haxxor-JS Launcher

if exist "node_modules\" (
echo Packages are already installed.
echo:
goto launch
) else ( 
echo Installing packages...
echo:
npm install
echo:
echo Packages successfully installed!
echo:
goto launch
)

:launch
echo Running Node.js...
start "" "http://localhost:666/tts.mp3?voice=joey&text=Welcome+to+Text2Speech-Haxxor-JS."
npm start