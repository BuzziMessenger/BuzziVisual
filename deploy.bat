@echo off
:: ==========================================
:: RETRO MESSENGER - DEPLOYMENT TOOL (2004 Style)
:: ==========================================
title Buzzi Messenger Deployer (2004) - w00t!
color 0b

echo.
echo  ==============================================================
echo    *~ BUZZI MESSENGER DEPLOYMENT TOOL (2004 STYLE) ~*
echo  ==============================================================
echo            _.-""""-._
echo          .'          '.
echo         /   O    O     \     Inbelverbinding status: OPTIMAAL
echo        ^|       ^        ^|    Modem Snelheid: 56 Kbps
echo         \   '-----'    /     Status: Klaar voor actie!
echo          '.        .'
echo            '-....-'
echo  ==============================================================
echo.

:: Check for Git
git --version >nul 2>&1
if errorlevel 1 goto nogit

:menu
echo Wat wil je doen?
echo ---------------------------------------
echo 1. Snel uploaden (git add, commit & push)
echo 2. Render Deployment uitleg (Full-Stack)
echo 3. Vercel Deployment uitleg (Serverless)
echo 4. MongoDB Koppelen gids
echo 5. Afsluiten
echo ---------------------------------------
set /p opt="Kies een optie (1-5): "

if "%opt%"=="1" goto quickdeploy
if "%opt%"=="2" goto render
if "%opt%"=="3" goto vercel
if "%opt%"=="4" goto mongo
if "%opt%"=="5" goto exit
goto menu

:quickdeploy
echo.
echo === [ FAST DEPLOY ACTIVE ] ===
echo.
echo Voer een commit-bericht in (of druk op Enter voor "update"):
set /p commitmsg="Bericht: "
if "%commitmsg%"=="" set commitmsg=update

echo.
echo [!] Bezig met: git add .
git add .

echo [!] Bezig met: git commit -m "%commitmsg%"
git commit -m "%commitmsg%"

echo [!] Bezig met: git push
git push

echo.
echo =======================================
echo OK! Je code is gepusht naar GitHub! 
echo Als je Render of Vercel hebt gekoppeld,
echo begint de online build nu automatisch! :-P
echo =======================================
pause
goto exit

:render
echo.
echo ==============================================================
echo             HOE DEPLOY IK DEZE FULL-STACK APP NAAR RENDER?
echo ==============================================================
echo  Aangezien dit een Node.js Express server + React app is, is
echo  Render de perfecte hostingpartij!
echo.
echo  1. Zorg dat je een project hebt op github.com en dat je met
echo     Optie 1 code pusht naar je GitHub repo.
echo.
echo  2. Ga naar https://dashboard.render.com/ en klik op "New" -^> "Web Service".
echo.
echo  3. Koppel je GitHub repository.
echo.
echo  4. Vul deze instellingen in:
echo     - Name: buzzi-messenger
echo     - Runtime: Node
echo     - Build Command: npm install && npm run build
echo     - Start Command: npm run start
echo.
echo  5. Klik op "Advanced" en voeg deze Environment Variables toe:
echo     - NODE_ENV: production
echo     - GEMINI_API_KEY: (Jouw eigen Google Gemini API key)
echo.
echo  Render start je server op poort 10000 en is direct online!
echo ==============================================================
pause
goto menu

:vercel
echo.
echo ==============================================================
echo             HOE DEPLOY IK DEZE APP NAAR VERCEL?
echo ==============================================================
echo  Vercel is ideaal voor statische (client-side) frontends. 
echo  Omdat we een Express backend hebben, raden we aan om Render
echo  te gebruiken voor de server, of je kunt de app deployen via
echo  de Vercel CLI:
echo.
echo  1. Installeer Vercel CLI lokaal: npm install -g vercel
echo  2. Typ: vercel login
echo  3. Typ in deze map: vercel
echo ==============================================================
pause
goto menu

:mongo
echo.
echo ==============================================================
echo           RETRO MESSENGER INTEGRATIE MET MONGODB GIDS
echo ==============================================================
echo  Om deze Buzzi Messenger groots te maken en berichten en buddy's echt
echo  op te slaan, voeg je MongoDB toe als database in server.ts!
echo.
echo  1. Installeer mongoose lokaal:
echo     npm install mongoose
echo.
echo  2. Maak een gratis MongoDB cluster aan op https://www.mongodb.com/cloud/atlas
echo.
echo  3. Koppel de database bovenaan je server.ts:
echo     import mongoose from "mongoose";
echo     mongoose.connect(process.env.MONGODB_URI);
echo.
echo  4. Maak een User of Message schema aan om berichten op te slaan:
echo     const MessageSchema = new mongoose.Schema({
echo         sender: String,
echo         text: String,
echo         timestamp: Date
echo     });
echo     const Msg = mongoose.model('Message', MessageSchema);
echo.
echo  Dit geeft je 100%% controle over alle nostalgic chats! 
echo ==============================================================
pause
goto menu

:nogit
echo.
echo ==============================================================
echo ERROR: GIT IS NIET GEVONDEN OP DEZE PC!
echo ==============================================================
echo Het lijkt erop dat Git niet is geinstalleerd of niet in je PATH-omgevingsvariabele staat.
echo Installeer Git via https://git-scm.com of controleer je installatie.
echo.
pause
goto exit

:exit
echo.
echo Bedankt voor het gebruiken van de Buzzi Messenger Deployment Tool!
echo Snel weer inloggen op Buzzi hoor! :-P
pause
