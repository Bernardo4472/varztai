import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import playersRoutes from "./routes/playerRoutes";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/players", playersRoutes);

io.on("connection", (socket) => {
  console.log("🔗 Naujas žaidėjas:", socket.id);

  socket.on("bet", (amount: number) => {
    console.log("🎲 Statymas:", amount);
  });

  socket.on("disconnect", () => {
    console.log("❌ Žaidėjas atsijungė:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveris paleistas ant ${PORT} porto`);
});
