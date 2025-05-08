import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server, Socket, DisconnectReason } from "socket.io"; // Added Socket type and DisconnectReason
import gamesRoute from "./routes/game/gameRoutes";
import authRoutes from "./routes/auth/authRoutes";
import playersRoutes from "./routes/players/playerRoutes";
import roomRoutes, { activeRooms } from "./routes/rooms/roomRoutes";
import { 
  initializeNewGame, 
  getGameState, 
  removeGameState, 
  transitionToBetting, 
  updateAndReturnGameState,
  handlePlayerBet, // Added handlePlayerBet
  handlePlayerHit, // Added handlePlayerHit
  handlePlayerStand, // Added handlePlayerStand
  handlePlayerDoubleDown, // Added Double Down
  playDealerTurn // Added playDealerTurn
  // resolveRound is called internally by playDealerTurn now
  // transitionToBetting is already imported above
} from "./gameLogic/gameManager";
import { BlackjackGameState, PlayerGameState, PlayerStatus } from "./types/gameTypes"; // Added PlayerStatus type
import { getPlayerDetailsById, updatePlayerBalanceInDb, updatePlayerStatsInDb } from "./services/playerService"; // Added playerService imports including stats update
import jwt from 'jsonwebtoken'; // Added for JWT verification

dotenv.config();

// Define a type for the expected JWT payload
interface JwtPayload {
  userId: string; // Assuming the JWT contains the database user ID
  // Add other properties like username if present in your JWT payload
}

const app = express();
const server = http.createServer(app);
// Explicit CORS options for HTTP routes
const corsOptions = {
  origin: 'http://localhost:5173', // Allow frontend origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies if needed later (good practice)
  optionsSuccessStatus: 204 
};

const io = new Server(server, { 
  cors: corsOptions // Use same options for Socket.IO for consistency
});

app.use(cors(corsOptions)); // Use explicit options for Express
app.use(express.json());

app.use("/api", authRoutes);
app.use("/players", playersRoutes);
app.use("/games", gamesRoute);
app.use("/api/rooms", roomRoutes);

io.on("connection", (socket: Socket) => { // Added type for socket
  console.log(`[Server] 🔗 New player connected: ${socket.id}`);
  let currentRoomIdForSocket: string | null = null; // Renamed to avoid conflict

  // This map will store socket.id -> database_userId if authentication is successful
  const socketIdToDbUserId: { [socketId: string]: string } = {};

  // --- Authenticate user via JWT from socket handshake ---
  const token = socket.handshake.auth.token;
  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      if (decoded && decoded.userId) {
        socketIdToDbUserId[socket.id] = decoded.userId; // Map socket.id to DB userId
        console.log(`[Server] Player ${socket.id} authenticated successfully. DB UserId: ${decoded.userId}`);
      } else {
        console.warn(`[Server] Player ${socket.id} JWT verification failed: userId missing in token payload.`);
        // Optionally, disconnect or mark as unauthenticated
        // socket.emit('auth_error', 'Invalid token: User ID missing.');
        // socket.disconnect();
      }
    } catch (err) {
      console.warn(`[Server] Player ${socket.id} JWT verification failed:`, (err as Error).message);
      // Optionally, disconnect or mark as unauthenticated
      // socket.emit('auth_error', `Invalid token: ${(err as Error).message}`);
      // socket.disconnect();
    }
  } else {
    console.log(`[Server] Player ${socket.id} connected without JWT token or JWT_SECRET is not set.`);
    // Handle unauthenticated connection:
    // - Allow connection but with limited functionality (e.g., guest mode, no DB persistence)
    // - Or, disconnect if authentication is strictly required:
    //   socket.emit('auth_error', 'Authentication token required.');
    //   socket.disconnect();
  }
  // --- END JWT Authentication ---


  socket.on("join_room_socket", async ({ roomId }: { roomId: string }) => { // Made async
    if (!roomId) {
      socket.emit("error_joining_room", "Room ID is required.");
      return;
    }
    const httpRoom = activeRooms[roomId];
    if (!httpRoom) {
      socket.emit("error_joining_room", `Room ${roomId} not found or not active.`);
      return;
    }

    const MAX_PLAYERS_PER_ROOM = 7; // Updated to 7 players
    if (httpRoom.players.length >= MAX_PLAYERS_PER_ROOM && !httpRoom.players.includes(socket.id)) {
      socket.emit("error_joining_room", `Room ${roomId} is full.`);
      return;
    }
    
    socket.join(roomId);
    currentRoomIdForSocket = roomId;

    if (!httpRoom.players.includes(socket.id)) {
      httpRoom.players.push(socket.id);
    }
    console.log(`[Server] Player ${socket.id} joined HTTP room ${roomId}. Sockets in HTTP room: ${httpRoom.players.join(', ')}`);

    let gameState = getGameState(roomId);
    if (!gameState) {
      // --- MODIFIED: Fetch player details from DB ---
      const playerDetailsForGamePromises = httpRoom.players.map(async (pid) => { // Removed index
        // Use the dbUserId obtained from JWT verification if available for this socket id (pid)
        const dbUserId = socketIdToDbUserId[pid]; 
        let name = `Player_${pid.slice(0, 4)}`; // Default name
        let balance = 1000; // Default balance

        if (dbUserId) {
          console.log(`[Server] join_room_socket: Attempting to fetch details for authenticated socket ${pid} (DB ID ${dbUserId})`);
          const details = await getPlayerDetailsById(dbUserId); // Pass the authenticated dbUserId
          if (details) {
            name = details.name;
            balance = details.balance;
            console.log(`[Server] join_room_socket: Fetched details for ${dbUserId}: Name=${name}, Balance=${balance}`);
          } else {
            console.log(`[Server] join_room_socket: No details found for ${dbUserId}, using defaults.`);
          }
        } else {
          console.log(`[Server] join_room_socket: No DB userId mapping for socket ${pid}, using defaults.`);
        }
        return { id: pid, name, balance };
      });

      const playerDetailsForGame = await Promise.all(playerDetailsForGamePromises);
      // --- END MODIFICATION ---

      const newGame = initializeNewGame(roomId, playerDetailsForGame);
      if (newGame) {
        gameState = newGame;
      } else {
        // Handle error: game initialization failed
        socket.emit("error_joining_room", `Failed to initialize game state for room ${roomId}.`);
        socket.leave(roomId);
        currentRoomIdForSocket = null;
        httpRoom.players = httpRoom.players.filter(p => p !== socket.id);
        return;
      }
    } else {
      if (!gameState.players[socket.id]) {
        // --- MODIFIED: Fetch details for new player joining existing game using authenticated ID ---
        let newPlayerName = `Player_${socket.id.slice(0, 4)}`;
        let newPlayerBalance = 1000; // Default balance

        const dbUserId = socketIdToDbUserId[socket.id]; // Use authenticated DB User ID for the current socket
        if (dbUserId) {
          console.log(`[Server] join_room_socket (existing game): Attempting to fetch details for new authenticated player ${socket.id} (DB ID ${dbUserId})`);
          const details = await getPlayerDetailsById(dbUserId);
          if (details) {
            newPlayerName = details.name;
            newPlayerBalance = details.balance;
            console.log(`[Server] join_room_socket (existing game): Fetched details for ${dbUserId}: Name=${newPlayerName}, Balance=${newPlayerBalance}`);
          } else {
            console.log(`[Server] join_room_socket (existing game): No details for ${dbUserId}, using defaults.`);
          }
        } else {
            console.log(`[Server] join_room_socket (existing game): No DB userId mapping for new player ${socket.id}, using defaults.`);
        }

        gameState.players[socket.id] = {
            id: socket.id, name: newPlayerName, balance: newPlayerBalance, // Added balance
            hand: [], score: 0, bet: null, 
            status: 'waiting', canHit: false, canStand: false, canDouble: false, canSplit: false
        } as PlayerGameState;
        gameState.messageLog.push(`${newPlayerName} has joined the game.`);
        // --- END MODIFICATION ---
        gameState = updateAndReturnGameState(roomId, gameState);
      }
    }

    if (!gameState) {
      socket.emit("error_joining_room", `Failed to initialize or retrieve game state for room ${roomId}.`);
      socket.leave(roomId);
      currentRoomIdForSocket = null;
      httpRoom.players = httpRoom.players.filter(p => p !== socket.id);
      return;
    }
    
    io.to(roomId).emit('game_state_update', gameState);
    console.log(`[Server] Player ${socket.id} processed for game in room ${roomId}. Current game phase: ${gameState.gamePhase}`);

    if (gameState.gamePhase === 'waiting_for_players' && Object.keys(gameState.players).length >= 1) { // Start with 1 for testing
        const updatedGameState = transitionToBetting(roomId);
        if (updatedGameState) {
            io.to(roomId).emit('game_state_update', updatedGameState);
            io.to(roomId).emit('game_phase_change', { phase: updatedGameState.gamePhase, message: "Place your bets!" });
            console.log(`[Server] Room ${roomId} automatically transitioned to betting.`);
        }
    }
  });

  socket.on("leave_room_socket", ({ roomId }: { roomId: string }) => {
    if (roomId && currentRoomIdForSocket === roomId) {
      socket.leave(roomId);
      if (activeRooms[roomId]) {
        activeRooms[roomId].players = activeRooms[roomId].players.filter(id => id !== socket.id);
        console.log(`[Server] Player ${socket.id} left HTTP room ${roomId}. Sockets remaining: ${activeRooms[roomId].players.length}`);
      }

      let gameState = getGameState(roomId);
      if (gameState && gameState.players[socket.id]) {
        const playerName = gameState.players[socket.id].name;
        delete gameState.players[socket.id];
        gameState.messageLog.push(`${playerName} has left the game.`);
        
        if (Object.keys(gameState.players).length === 0) {
          removeGameState(roomId);
          console.log(`[Server] Room ${roomId}: All players left. Game state removed.`);
        } else {
          gameState = updateAndReturnGameState(roomId, gameState);
          io.to(roomId).emit('game_state_update', gameState);
          io.to(roomId).emit('player_left_game', { playerId: socket.id, playerName });
        }
      }
      currentRoomIdForSocket = null;
    }
  });

  socket.on("disconnect", (reason: DisconnectReason) => { // Used DisconnectReason directly
    console.log(`[Server] Player ${socket.id} disconnected: ${reason}`);
    if (currentRoomIdForSocket) {
      const roomId = currentRoomIdForSocket;
      if (activeRooms[roomId]) {
        activeRooms[roomId].players = activeRooms[roomId].players.filter(id => id !== socket.id);
         console.log(`[Server] Player ${socket.id} removed from HTTP room ${roomId} due to disconnect. Sockets remaining: ${activeRooms[roomId].players.length}`);
      }
      let gameState = getGameState(roomId);
      if (gameState && gameState.players[socket.id]) {
        const playerName = gameState.players[socket.id].name;
        delete gameState.players[socket.id];
        gameState.messageLog.push(`${playerName} disconnected and left the game.`);

        if (Object.keys(gameState.players).length === 0) {
          removeGameState(roomId);
          console.log(`[Server] Room ${roomId}: All players left after disconnect. Game state removed.`);
        } else {
          gameState = updateAndReturnGameState(roomId, gameState);
          io.to(roomId).emit('game_state_update', gameState);
          io.to(roomId).emit('player_left_game', { playerId: socket.id, playerName });
        }
      }
      currentRoomIdForSocket = null;
    }
  });

  socket.on('player_action', (data: { roomId: string, actionType: string, payload?: any }) => {
    const { roomId, actionType, payload } = data;
    if (currentRoomIdForSocket !== roomId) {
      console.warn(`[Server] Player ${socket.id} sent action for room ${roomId} but is in ${currentRoomIdForSocket || 'no room'}`);
      return;
    }

    let gameState = getGameState(roomId);
    if (!gameState || !gameState.players[socket.id] || gameState.players[socket.id].status === 'waiting') {
      // Added check for player existence in game state
      console.warn(`[Server] No game state, player not in game, or player not active for action in room ${roomId}`);
      return;
    }

    console.log(`[Server] Room ${roomId}: Received action '${actionType}' from player ${socket.id}`, payload || '');

    let newGameState: BlackjackGameState | { error: string } | null = null;

    if (actionType === 'PLACE_BET') {
      if (payload && typeof payload.amount === 'number') {
        newGameState = handlePlayerBet(roomId, socket.id, payload.amount);
      } else {
        socket.emit('action_error', { action: actionType, message: 'Invalid bet payload. Amount is required.' });
        return;
      }
    } else if (actionType === 'HIT') {
      newGameState = handlePlayerHit(roomId, socket.id);
    } else if (actionType === 'STAND') {
      newGameState = handlePlayerStand(roomId, socket.id);
    } else if (actionType === 'DOUBLE_DOWN') { // Added Double Down handler
      newGameState = handlePlayerDoubleDown(roomId, socket.id);
    } else {
      console.warn(`[Server] Unknown actionType: ${actionType}`);
      socket.emit('action_error', { action: actionType, message: `Unknown action: ${actionType}` });
      return;
    }

    if (newGameState) {
      if ('error' in newGameState) {
        // Send error back to the specific player
        socket.emit('action_error', { action: actionType, message: newGameState.error });
        // Optionally, send the current (unchanged) game state back to the player if needed
        // const currentGameState = getGameState(roomId);
        // if (currentGameState) socket.emit('game_state_update', currentGameState);
      } else {
        // Broadcast the updated game state to everyone in the room
        io.to(roomId).emit('game_state_update', newGameState);
        
        // If the phase changed to dealing_initial (meaning all bets are in)
        // This logic will soon move into dealInitialCardsAndTransition
        // if (newGameState.gamePhase === 'dealing_initial') { // This was a placeholder
        //     io.to(roomId).emit('game_phase_change', { phase: newGameState.gamePhase, message: "All bets are in. Dealing cards..." });
        //     console.log(`[Server] Room ${roomId}: All bets placed. Initial cards will be dealt by GameManager.`);
        // }
        // After handlePlayerBet, handlePlayerHit, or handlePlayerStand, check for phase changes
        if (newGameState.gamePhase === 'player_turns') {
             // If still player turns, just update state (already broadcasted). Maybe emit whose turn it is.
             io.to(roomId).emit('turn_change', { 
                 currentPlayerTurn: newGameState.currentPlayerTurn,
                 message: newGameState.players[newGameState.currentPlayerTurn!]?.name + "'s turn." // Added null assertion assuming turn exists
             });
             console.log(`[Server] Room ${roomId}: Player action processed. Phase: ${newGameState.gamePhase}. Current turn: ${newGameState.currentPlayerTurn}`);
        } else if (newGameState.gamePhase === 'dealer_turn') {
            // If phase changed to dealer_turn, notify clients
             io.to(roomId).emit('game_phase_change', { 
                 phase: newGameState.gamePhase, 
                 message: "Dealer's turn." 
             });
             console.log(`[Server] Room ${roomId}: All players finished. Phase: ${newGameState.gamePhase}. Triggering dealer turn.`);
             // Trigger dealer logic after a short delay
             setTimeout(() => {
                const finalState = playDealerTurn(roomId);
                if (finalState && !('error' in finalState)) {
                    io.to(roomId).emit('game_state_update', finalState);
                    // Check if the phase is now round_over
                    if (finalState.gamePhase === 'round_over') {
                         io.to(roomId).emit('game_phase_change', { 
                             phase: finalState.gamePhase, 
                             message: "Round over. Determining results..." 
                         });
                         console.log(`[Server] Room ${roomId}: Dealer turn finished and round resolved. Phase: ${finalState.gamePhase}.`);
                         
                         // --- MODIFIED: Persist Balance Changes to Database ---
                         Object.values(finalState.players).forEach(async player => { // Made async
                            let payoutMultiplier = 0;
                            if (player.status === 'won') payoutMultiplier = 1;
                            else if (player.status === 'blackjack') payoutMultiplier = 1.5;
                            else if (player.status === 'lost') payoutMultiplier = -1;
                            
                            const balanceChange = (player.bet ?? 0) * payoutMultiplier;

                            if (balanceChange !== 0) {
                                const dbUserId = socketIdToDbUserId[player.id]; // Use authenticated DB User ID
                                if (dbUserId) {
                                    console.log(`[Server] Persisting balance change for authenticated socket ${player.id} (DB User ${dbUserId}). Change: ${balanceChange}`);
                                    try {
                                        // Update Balance
                                        const balanceSuccess = await updatePlayerBalanceInDb(dbUserId, balanceChange);
                                        if (balanceSuccess) {
                                            console.log(`[Server] DB Balance updated successfully for DB User ${dbUserId}.`);
                                        } else {
                                            console.warn(`[Server] DB Balance update FAILED for DB User ${dbUserId} (service returned false).`);
                                        }
                                        // Update Stats (pass the final player status)
                                        const statsSuccess = await updatePlayerStatsInDb(dbUserId, player.status as PlayerStatus);
                                        if (statsSuccess) {
                                            console.log(`[Server] DB Stats updated successfully for DB User ${dbUserId} based on result: ${player.status}`);
                                        } else {
                                             console.warn(`[Server] DB Stats update FAILED for DB User ${dbUserId} (service returned false).`);
                                        }

                                    } catch (error) {
                                        console.error(`[Server] DB Balance/Stats update FAILED for DB User ${dbUserId}:`, error);
                                    }
                                } else {
                                  console.warn(`[Server] Cannot update DB balance/stats for socket ${player.id}: Missing DB userId mapping.`);
                                }
                            } else {
                                // Even if balanceChange is 0 (e.g., push), update stats if it was a played round
                                const dbUserId = socketIdToDbUserId[player.id];
                                if (dbUserId && (player.status === 'push' || player.status === 'blackjack' || player.status === 'busted')) {
                                     try {
                                        const statsSuccess = await updatePlayerStatsInDb(dbUserId, player.status as PlayerStatus);
                                        if (statsSuccess) {
                                            console.log(`[Server] DB Stats updated successfully for DB User ${dbUserId} based on result: ${player.status}`);
                                        } else {
                                             console.warn(`[Server] DB Stats update FAILED for DB User ${dbUserId} (service returned false).`);
                                        }
                                     } catch (error) {
                                         console.error(`[Server] DB Stats update FAILED for DB User ${dbUserId}:`, error);
                                     }
                                }
                            }
                         });
                         // --- End MODIFICATION ---

                         // Trigger next round after a delay
                         setTimeout(() => {
                            const nextRoundState = transitionToBetting(roomId);
                            if (nextRoundState) {
                                io.to(roomId).emit('game_state_update', nextRoundState);
                                io.to(roomId).emit('game_phase_change', { phase: nextRoundState.gamePhase, message: "Place your bets for the next round!" });
                                console.log(`[Server] Room ${roomId}: Automatically starting next round.`);
                            } else {
                                console.error(`[Server] Room ${roomId}: Failed to transition to next round betting.`);
                                // Maybe emit an error or try again?
                            }
                         }, 5000); // Wait 5 seconds before starting next round betting
                    }
                } else if (finalState && 'error' in finalState) {
                    // This error comes from playDealerTurn OR resolveRound
                    console.error(`[Server] Error during dealer turn or resolution for room ${roomId}: ${finalState.error}`);
                    // Notify clients? Maybe just log for now.
                }
             }, 1500); // Delay in milliseconds (e.g., 1.5 seconds)

        } else if (newGameState.gamePhase === 'dealing_initial') {
             // This phase is transient, usually immediately followed by player_turns after dealing
             // No specific event needed here as game_state_update covers it.
        } else if (newGameState.gamePhase === 'betting') {
             // This might happen if a round ends and we transition back
             io.to(roomId).emit('game_phase_change', { phase: newGameState.gamePhase, message: "Place your bets for the next round!" });
        }
      }
    }
  });
});

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveris paleistas ant ${PORT} porto`);
});
