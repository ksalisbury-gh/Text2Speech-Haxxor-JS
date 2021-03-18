@echo off
title Text2Speech-Haxxor-JS

set FILEPATH=%cd%\audio\

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
:methodreask
set /p METHOD= Method:
if "%METHOD%"=="1" (
	goto nodejs
)
if "%METHOD%"=="2" (
	goto mp3
)
if "%METHOD%"=="" (
	echo You're supposed to choose.
	echo:
	goto methodreask
)

:nodejs
echo Let's make sure Node.js is running.
echo:
echo Running the launcher is the only way you
echo will be able to use the GET method.
echo:
echo Press 0 if Node.js isn't running right now.
echo Otherwise, press 1.
echo:
:nodereask
set /p RUN_NODEJS= Option: 
echo:
if "%RUN_NODEJS%"=="0" (
	echo Opening the launcher...
	echo:
	start %cd%\launcher.bat
	PING -n 3 127.0.0.1>nul
	goto get
)
if "%RUN_NODEJS%"=="1" (
	goto get
)
if "%RUN_NODEJS%"=="" (
	echo You're supposed to choose.
	echo:
	goto nodereask
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
:getreask
set /p GET_OPTION= Option: 
if "%GET_OPTION%"=="1" (
	start "" "http://localhost:666/tts.mp3?voice=%VOICE%&text=%TEXT%"
	echo Opened link in default browser.
	echo:
	pause
	exit
)
if "%GET_OPTION%"=="2" (
	echo|set/p="http://localhost:666/tts.mp3?voice=%VOICE%&text=%TEXT%"|clip
	echo Copied link to clipboard.
	echo:
	pause
	exit
)
if "%GET_OPTION%"=="3" (
	exit
)
if "%GET_OPTION%"=="" (
	echo You're supposed to choose.
	echo:
	goto getreask
)


:mp3
echo Generating MD5 hash from inputs...
for /f "delims=" %%b in ('md5.exe -d%VOICE%_%TEXT%_%date:~-4,4%%date:~-7,2%%date:~-10,2%T%time:~-11,2%%time:~-8,2%%time:~-5,2%Z -l') do set FILENAME=%%b
set FILE=%FILENAME%.mp3
echo:
echo Would you like to name your file something else?
echo:
echo If not, press enter to set it to %FILE%.
echo ^(NOTE: .mp3 will automatically be added.^)
echo:
set /p FILENAME= Filename:
echo:
echo Would you like to save it to another path?
echo:
echo If you do, please enter the path in here where you'd like to save to.
echo If not, press enter to save it to the "audio" folder.
echo:
echo ^(NOTE: Extra backslash will automatically be added.^)
set /p THEFILEPATH= Path: 
set FILEPATH=%THEFILEPATH%\
echo:
echo Running Node.js...
node "load.js" "%VOICE%" "%TEXT%" "%FILEPATH%%FILE%"
echo:
echo File saved.
echo:
echo Press 1 to open the file
echo Press 2 to open where you saved to
echo Press 3 to exit
echo:
:whattodonext
set /p OPTION= Option:
if "%OPTION%"=="1" (
	start "" "%FILEPATH%\%FILE%"
	echo:
	pause
	exit
)
if "%OPTION%"=="2" (
	start explorer.exe "%FILEPATH%\"
	echo:
	pause
	exit
)
if "%OPTION%"=="3" (
	exit
)
if "%OPTION%"=="" (
	echo You're supposed to choose.
	echo:
	goto whattodonext
)