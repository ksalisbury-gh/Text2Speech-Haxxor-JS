@echo off
title Text2Speech-Haxxor-JS
set FILEPATH=%cd%\audio

echo Before we get started, let's make sure Node.js is running.
echo:
echo Press 0 if Node.js isn't running right now.
echo Otherwise, press 1.
echo:
set /p RUN_NODEJS= Option: 
echo:
if %RUN_NODEJS%==0 (
echo Opening the launcher...
echo:
start %cd%\launcher.bat
PING -n 3 127.0.0.1>nul
goto main
) else if %RUN_NODEJS%==1 (
goto main
) else (
echo You're supposed to choose.
set /p RUN_NODEJS= Option: 
)


:main
echo Enter the name of the voice you'd like to use.
echo ^(NOTE: MUST BE ALL LOWERCASES^)
echo:
set /p VOICE= Voice:
echo:
echo Enter what you would like it to say.
echo:
set /p TEXT= Text:
echo:
echo Press 1 if you're using the GET method
echo Press 2 if you're using the save to local method
echo:
set /p METHOD= Method:
if %METHOD%==1 (
goto get
) else if %METHOD%==2 (
goto mp3
) else (
echo You're supposed to choose.
set /p METHOD= Option: 
)



:get
echo Link:
echo http://localhost:666/tts.mp3?voice=%VOICE%^&text=%TEXT%
echo:
echo Whatever browser you're using will automatically URL-encode
echo the text when it opens.
echo:
echo Press 1 to open it in your default browser
echo Press 2 to copy the link to clipboard
echo Press 3 to exit
echo:
set /p GET_OPTION= Option: 
echo:
if %GET_OPTION%==1 (
start "" "http://localhost:666/tts.mp3?voice=%VOICE%&text=%TEXT%"
echo Opened link in default browser.
echo:
set /p EXIT= Press Enter to exit.
exit
) else if %GET_OPTION%==2 (
echo|set/p="http://localhost:666/tts.mp3?voice=%VOICE%&text=%TEXT%"|clip
echo Copied link to clipboard.
echo:
set /p EXIT= Press Enter to exit.
exit
) else if %GET_OPTION%==3 (
exit
) else (
echo You're supposed to choose.
set /p GET_OPTION= Option: 
)


:mp3
echo Generating MD5 hash from inputs...
call md5.exe -d%MOVIEID% -l > md5.txt
for /f "delims=" %%i in (md5.txt) do set FILENAME=%%i
set FILE=%FILENAME%.mp3
echo:
echo Would you like to name your file something else?
echo:
echo If not, press enter to set it to %FILE%.
echo ^(NOTE: .MP3 WILL AUTOMATICALLY BE ADDED.^)
echo:
set /p FILENAME= Filename:
echo:
echo Would you like to save it to another path?
echo:
echo If you do, please enter the path in here where you'd like to save to.
echo If not, press enter to save it to the "audio" folder.
echo:
set /p FILEPATH= Path: 
echo:
echo Running Node.js...
node load.js %VOICE% %TEXT% "%FILEPATH%\%FILE%"
echo:
echo File saved.
echo:
echo Press 1 to open the file
echo Press 2 to open where you saved to
echo Press 3 to exit
echo:
set /p OPTION= Option:
if %OPTION%==1 (
start "%FILEPATH%\%FILE%"
echo:
set /p EXIT= Press Enter to exit.
exit
) else if %OPTION%==2 (
start "%FILEPATH%\"
echo:
set /p EXIT= Press Enter to exit.
exit
) else if %OPTION%==3 (
exit
) else (
echo You're supposed to choose.
set /p OPTION= Option:
)