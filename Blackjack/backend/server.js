require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const db = require("./config/db");
const playersRoutes = require("./routes/playersRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// API maršrutai
app.use("/players", playersRoutes);

// WebSocket logika
io.on("connection", (socket) => {
    console.log(`🔗 Naujas žaidėjas prisijungė: ${socket.id}`);

    socket.on("bet", (amount) => {
        console.log(`🎲 Statymas: ${amount}`);
    });

    socket.on("disconnect", () => {
        console.log(`❌ Žaidėjas atsijungė: ${socket.id}`);
    });
});

// Paleidimas
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Serveris veikia ant ${PORT} porto`));
