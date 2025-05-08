import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

interface Room {
  roomId: string;
  players: string[]; // For now, just store player identifiers (e.g., socket IDs or user IDs)
  createdAt: Date;
}

// In-memory store for rooms
// Exported for access in server.ts for socket handling - consider refactoring to a service
export const activeRooms: { [roomId: string]: Room } = {};

// POST /api/rooms/create - Create a new game room
router.post('/create', (req: Request, res: Response) => {
  const newRoomId = uuidv4().slice(0, 8); // Generate a shorter, somewhat unique ID
  const newRoom: Room = {
    roomId: newRoomId,
    players: [],
    createdAt: new Date(),
  };
  activeRooms[newRoomId] = newRoom;
  console.log(`🚪 Room created: ${newRoomId}`, newRoom);
  res.status(201).json({ roomId: newRoomId, message: 'Room created successfully' });
});

// POST /api/rooms/join - Join an existing game room
router.post('/join', (req: Request, res: Response) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ message: 'Room ID is required' });
  }

  const room = activeRooms[roomId];
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  // Placeholder for adding a player to the room.
  // In a real scenario, you'd add the authenticated user's ID or a socket ID.
  // For now, let's simulate adding a generic player.
  // You might also want to check if the room is full.
  console.log(`👤 Player attempting to join room: ${roomId}`);
  // room.players.push(req.user.id); // Example if you have user authentication

  res.status(200).json({ roomId: room.roomId, message: 'Successfully joined room (placeholder)' });
});

export default router;
