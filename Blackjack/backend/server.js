require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// PostgreSQL prijungimas
const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Patikriname, ar duomenų bazė veikia
db.connect()
    .then(() => console.log("🔗 Prisijungta prie PostgreSQL"))
    .catch(err => console.error("❌ DB klaida:", err));

const players = {}; // Žaidėjų sąrašas

// WebSockets žaidėjams
io.on("connection", (socket) => {
    console.log(`🔗 Naujas žaidėjas prisijungė: ${socket.id}`);

    players[socket.id] = { id: socket.id, balance: 1000 };
    io.emit("players", players); // Atnaujiname visiems prisijungusiems

    // Kai žaidėjas atlieka statymą
    socket.on("bet", (amount) => {
        if (players[socket.id]) {
            players[socket.id].balance -= amount;
            io.emit("players", players); // Atnaujinti visiems
        }
    });

    // Kai žaidėjas atsijungia
    socket.on("disconnect", () => {
        console.log(`❌ Žaidėjas atsijungė: ${socket.id}`);
        delete players[socket.id];
        io.emit("players", players); // Atnaujinti visiems
    });
});

// API testavimui
app.get("/", (req, res) => {
    res.send("Blackjack serveris veikia!");
});

// Serverio paleidimas
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveris paleistas ant ${PORT} porto`));
