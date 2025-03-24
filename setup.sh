#!/bin/bash

echo "🚀 Pradedamas Blackjack projekto diegimas..."

# Patikrina ar Node.js įdiegtas
if ! command -v node &> /dev/null
then
    echo "❌ Node.js nerastas. Įdiekite Node.js ir bandykite dar kartą."
    exit
fi

# Patikrina ar npm įdiegtas
if ! command -v npm &> /dev/null
then
    echo "❌ npm nerastas. Įdiekite npm ir bandykite dar kartą."
    exit
fi

# Inicializuojame backend
if [ ! -d "backend" ]; then
    echo "📂 Sukuriamas backend aplankas..."
    mkdir backend
fi

cd backend

if [ ! -f "package.json" ]; then
    echo "📦 Inicializuojamas backend projektas..."
    npm init -y
fi

echo "📦 Diegiamos backend priklausomybės..."
npm install express dotenv pg cors socket.io http
npm install --save-dev nodemon eslint prettier husky
cd ..

# Inicializuojame frontend
if [ ! -d "frontend" ]; then
    echo "📂 Sukuriamas frontend su Create React App..."
    npx create-react-app frontend
fi

cd frontend

echo "📦 Diegiamos frontend priklausomybės..."
npm install react-router-dom
npm install --save-dev eslint prettier husky
cd ..

# Paklausiama, ar norima paleisti projektą
read -p "✅ Priklausomybės įdiegtos! Ar norite paleisti projektą dabar? (y/n) " runNow

if [[ "$runNow" == "y" ]]; then
    
    echo "🚀 Paleidžiame backend ir frontend..."
    cd backend && npm run dev & cd ../frontend && npm start
else
    echo "✅ Setup'as baigtas! Paleisti backend galite su 'cd backend && npm run dev', o frontend su 'cd frontend && npm start'."
fi
