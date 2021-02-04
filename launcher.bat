@echo off
title Text2Speech-Haxxor-JS

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
npm start