# Blackjack Project

## 📌 Aprašymas
Tai yra daugeliui žaidėjų skirtas **Blackjack** žaidimas su **Node.js**, **React**, **Socket.io** ir **PostgreSQL**. 

## 📂 Projekto Struktūra
```
/blackjack-project
 ├── /backend               # Backend su Node.js + Express + Socket.io
 │   ├── /config            # Konfigūracijos (DB, aplinkos kintamieji)
 │   │   ├── db.js          # PostgreSQL prisijungimas
 │   │   ├── dotenv.js      # Aplinkos kintamųjų valdymas
 │   ├── /controllers       # API logika (žaidėjų, statymų valdymas)
 │   │   ├── playersController.js
 │   │   ├── gameController.js
 │   ├── /models            # DB schemos ir ORM modeliai
 │   │   ├── playerModel.js
 │   ├── /routes            # API maršrutai
 │   │   ├── playersRoutes.js
 │   │   ├── gameRoutes.js
 │   ├── /sockets           # WebSocket logika
 │   │   ├── gameSocket.js
 │   ├── server.js          # Pagrindinis Express serveris
 │   ├── package.json       # Node.js priklausomybės
 │   ├── .env               # Slaptieji kintamieji (DB prisijungimai)
 ├── /frontend              # React aplikacija (Blackjack UI)
 │   ├── /public
 │   │   ├── index.html
 │   │   ├── gameIcon.png
 │   ├── /src
 │   │   ├── /components
 │   │   │   ├── Login.js
 │   │   │   ├── Register.js
 │   │   │   ├── Main.js
 │   │   ├── /services      # API fetch funkcijos
 │   │   │   ├── authService.js
 │   │   │   ├── gameService.js
 │   │   ├── App.js
 │   │   ├── index.js
 │   ├── package.json
 │   ├── .env               # Frontend API URL konfigūracija
 ├── /database              # SQL migracijos
 │   ├── schema.sql         # DB schema
 │   ├── seed.sql           # Testiniai duomenys
 ├── .gitignore
 ├── README.md
```

---

## 🚀 Kaip paleisti projektą
### 1️⃣ Klonuoti repozitoriją
```bash
git clone https://github.com/TAVO-REPO-NUORODA.git
cd blackjack-project
```

### 2️⃣ Parsisiųsti priklausomybes
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3️⃣ Paleisti **backend**
```bash
cd backend
npm run dev  # Paleisti serverį
```

### 4️⃣ Paleisti **frontend**
```bash
cd frontend
npm start  # Paleisti React aplikaciją
```

---

## 🔀 Kaip naudoti Git

### 1️⃣ Sukurti naują branch savo darbui
```bash
git checkout -b feature/tavo-darbas
```

### 2️⃣ Įrašyti pakeitimus ir išsiųsti į GitHub
```bash
git add .
git commit -m "Pridėjau prisijungimo puslapį"
git push origin feature/tavo-darbas
```

### 3️⃣ Sukurti Pull Request (PR) GitHub'e
- Eik į **GitHub > Pull Requests** ir paspausk **New Pull Request**.
- Pasirink savo branch'ą (`feature/tavo-darbas`) ir sujunk jį su `main`.
- Paprašyk komandos narių peržiūrėti kodą.

### 4️⃣ Atsinaujinti naujausią projekto versiją
Kai kažkas sujungė kodą į `main`, atsinaujink savo kodą:
```bash
git checkout main
git pull origin main
```

---

## 📌 Svarbios taisyklės
✅ Visada dirbk savo atskirame branch'e (**nerašyk tiesiai į `main`!**)
✅ Visada daryk **`git pull`**, kad turėtum naujausią kodą
✅ Prieš darant `Pull Request`, patikrink ar kodas veikia
✅ Komentuok savo kodą ir rašyk aiškius commit pavadinimus

