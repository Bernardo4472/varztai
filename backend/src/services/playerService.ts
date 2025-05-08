// backend/src/services/playerService.ts
import { Pool } from 'pg'; // Assuming use of node-postgres

// Configure connection pool using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure DATABASE_URL is set in your .env for the backend
  // SSL might be required depending on your PostgreSQL provider (e.g., Heroku, AWS RDS)
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('[PlayerService] Connected to PostgreSQL database.');
});

pool.on('error', (err: Error, client?: any) => { // Explicitly type err, client can be any for now
  console.error('[PlayerService] Unexpected error on idle client', err, client);
  process.exit(-1); // Or handle more gracefully
});


interface PlayerDetails {
  userId: string;
  name: string;
  balance: number;
}

/**
 * Fetches player details from the database.
 * TODO: Implement actual database query and error handling.
 * TODO: Secure this function, possibly by verifying the token against an auth service or session.
 * @param userId - The ID of the user to fetch.
 * @param token - The authentication token (currently unused, for future auth implementation).
 * @returns PlayerDetails or null if not found or error.
 */
export const getPlayerDetailsById = async (userId: string, token?: string): Promise<PlayerDetails | null> => {
  // Token is currently unused but kept for future auth integration
  console.log(`[PlayerService] Attempting to fetch details for userId: ${userId}`);
  
  // Convert userId to number if your DB stores 'id' as integer
  const numericUserId = parseInt(userId, 10);
  if (isNaN(numericUserId)) {
    console.error(`[PlayerService] Invalid userId format: ${userId}. Must be a number.`);
    return null;
  }

  try {
    const result = await pool.query('SELECT id, username, balance FROM users WHERE id = $1', [numericUserId]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Ensure balance is a number, as NUMERIC can sometimes be returned as string by pg driver
      const balance = typeof user.balance === 'string' ? parseFloat(user.balance) : user.balance;
      return { userId: user.id.toString(), name: user.username, balance: balance };
    }
    console.warn(`[PlayerService] User with id ${numericUserId} not found.`);
    return null;
  } catch (error) {
    console.error(`[PlayerService] Error fetching player details for userId ${numericUserId}:`, error);
    return null;
  }
};

/**
 * Updates a player's balance in the database.
 * TODO: Implement actual database query and error handling.
 * TODO: Secure this function.
 * @param userId - The ID of the user whose balance is to be updated.
 * @param balanceChange - The amount to change the balance by (can be positive or negative).
 * @param token - The authentication token (currently unused).
 * @returns True if successful, false otherwise.
 */
export const updatePlayerBalanceInDb = async (userId: string, balanceChange: number, token?: string): Promise<boolean> => {
  // Token is currently unused
  console.log(`[PlayerService] Attempting to update balance for userId: ${userId} by ${balanceChange}`);
  
  const numericUserId = parseInt(userId, 10);
  if (isNaN(numericUserId)) {
    console.error(`[PlayerService] Invalid userId format for balance update: ${userId}. Must be a number.`);
    return false;
  }

  if (typeof balanceChange !== 'number' || isNaN(balanceChange)) {
    console.error(`[PlayerService] Invalid balanceChange value: ${balanceChange}. Must be a number.`);
    return false;
  }

  try {
    // Using a transaction to ensure atomicity if more complex logic were added (e.g., logging transaction)
    await pool.query('BEGIN');
    const result = await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance', 
      [balanceChange, numericUserId]
    );
    await pool.query('COMMIT');

    if (result.rowCount && result.rowCount > 0) {
      console.log(`[PlayerService] Balance for userId ${numericUserId} updated. New balance: ${result.rows[0].balance}. Change applied: ${balanceChange}`);
      return true;
    }
    // If rowCount is 0, it means the user ID was not found. Rollback is not strictly necessary for a single UPDATE.
    console.warn(`[PlayerService] User ${numericUserId} not found for balance update, or balance was unchanged. No rows affected.`);
    return false;
  } catch (error) {
    await pool.query('ROLLBACK'); // Rollback in case of error
    console.error(`[PlayerService] Error updating balance for userId ${numericUserId}:`, error);
    return false;
  }
};

/**
 * Updates a player's game statistics in the database.
 * @param userId - The ID of the user whose stats are to be updated.
 * @param gameResult - The final status of the player for the round.
 * @returns True if successful, false otherwise.
 */
import { PlayerStatus } from '../types/gameTypes'; // Import the PlayerStatus type

export const updatePlayerStatsInDb = async (userId: string, gameResult: PlayerStatus): Promise<boolean> => {
    console.log(`[PlayerService] Attempting to update stats for userId: ${userId} with result: ${gameResult}`);

    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        console.error(`[PlayerService] Invalid userId format for stats update: ${userId}. Must be a number.`);
        return false;
    }

    let winIncrement = 0;
    let lossIncrement = 0;
    let gamePlayedIncrement = 0;
    const gameResultStr = gameResult as string; // Cast to string to bypass faulty TS check

    // Detailed log for debugging string comparison
    console.log(`[PlayerService] DEBUG: Comparing gameResultStr: '${gameResultStr}' (length: ${gameResultStr.length}, type: ${typeof gameResultStr}) with known statuses.`);
    console.log(`[PlayerService] DEBUG: Is gameResultStr === 'won'? ${gameResultStr === 'won'}`);
    console.log(`[PlayerService] DEBUG: Is gameResultStr === 'blackjack'? ${gameResultStr === 'blackjack'}`);
    console.log(`[PlayerService] DEBUG: Is gameResultStr === 'lost'? ${gameResultStr === 'lost'}`);
    console.log(`[PlayerService] DEBUG: Is gameResultStr === 'busted'? ${gameResultStr === 'busted'}`);
    console.log(`[PlayerService] DEBUG: Is gameResultStr === 'push'? ${gameResultStr === 'push'}`);


    // Using if/else if to avoid potential TypeScript issues with switch/map on union types in this environment
    if (gameResultStr === 'won' || gameResultStr === 'blackjack') { // Corrected to 'won'
        winIncrement = 1;
        gamePlayedIncrement = 1;
    } else if (gameResultStr === 'lost' || gameResultStr === 'busted') { // Corrected to 'lost'
        lossIncrement = 1;
        gamePlayedIncrement = 1;
    } else if (gameResultStr === 'push') {
        gamePlayedIncrement = 1;
    } else if (gameResultStr === 'stood' || gameResultStr === 'waiting' || gameResultStr === 'betting' || gameResultStr === 'playing') {
        // No stat changes for these statuses
        console.log(`[PlayerService] No database update for stats needed for status (e.g. stood, waiting): '${gameResultStr}'`);
        return true;
    } else {
        // Handle any unexpected PlayerStatus values not explicitly covered
        console.warn(`[PlayerService] Unhandled game result (fell to final else): '${gameResultStr}' for stats update. No stats will be changed.`);
        return true; // Return true as it's not a DB error, just no action.
    }

    // If, after the conditions, no increments are set (e.g., for 'push' if gamePlayedIncrement was not set, though it is now)
    // This check is a safeguard.
    if (winIncrement === 0 && lossIncrement === 0 && gamePlayedIncrement === 0) {
         console.log(`[PlayerService] All increments determined to be zero for status: ${gameResult}. No DB update.`);
         return true;
    }

    try {
        const result = await pool.query(
            `UPDATE users 
             SET 
               wins = wins + $1, 
               losses = losses + $2, 
               games_played = games_played + $3
             WHERE id = $4`,
            [winIncrement, lossIncrement, gamePlayedIncrement, numericUserId]
        );

        if (result.rowCount && result.rowCount > 0) {
            // This log is crucial to confirm the DB operation reported success and what it *thought* it did.
            console.log(`[PlayerService] DB STATS UPDATE SUCCEEDED for userId ${numericUserId}. Applied Increments: Wins+${winIncrement}, Losses+${lossIncrement}, Games+${gamePlayedIncrement}. Rows affected: ${result.rowCount}`);
            return true;
        }
        // This means the UPDATE query ran but didn't find/affect any rows.
        console.warn(`[PlayerService] User ${numericUserId} not found for stats update, or no rows affected by query.`);
        return false;
    } catch (error) {
        console.error(`[PlayerService] Error updating stats for userId ${numericUserId}:`, error);
        return false;
    }
};


// Potentially, a function to map socket.id to userId if not handled elsewhere
// This is a critical piece. For now, we'll assume this mapping is provided
// to the service calls or handled at a higher level (e.g., in server.ts upon connection).

/*
interface SocketUserMap {
  [socketId: string]: string; // socket.id -> database userId
}
const socketToUserMap: SocketUserMap = {};

export const mapSocketToUser = (socketId: string, userId: string) => {
  socketToUserMap[socketId] = userId;
  console.log(`[PlayerService] Mapped socket ${socketId} to user ${userId}`);
};

export const getUserIdFromSocket = (socketId: string): string | undefined => {
  return socketToUserMap[socketId];
};
*/

// Example of how you might initialize the connection pool or other setup
// No need for explicit pool.connect() call here as node-postgres handles connections on first query.
// The event listeners for 'connect' and 'error' are good for monitoring.
