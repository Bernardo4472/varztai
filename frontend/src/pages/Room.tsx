import React, { useEffect, useState, useRef, useCallback } from 'react'; // Added useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
// Remove direct style import if BlackjackGame handles its own styles
// import styles from '../features/blackjack/components/BlackjackGame.module.css';
import { BlackjackGameState, PlayerGameState, Card, GamePhase } from '../types/gameTypes'; // Import types from frontend file
import BlackjackGame from '../features/blackjack/components/BlackjackGame'; // Import the main game component

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Remove CardDisplay if it's defined within BlackjackGame or not needed here

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const socketRef = useRef<Socket | null>(null); // Keep only one socketRef
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<BlackjackGameState | null>(null); // Store full game state
  // Remove betAmount state if BlackjackGame handles its own input state
  // const [betAmount, setBetAmount] = useState<string>("10");
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null); // Store this client's socket ID
  const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
  
    useEffect(() => {
      audioRef.current = new Audio("/sounds/background.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.1;
  
      return () => {
        audioRef.current?.pause();
      };
    }, []);
  
    const startMusic = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn("Naršyklė neleido automatiškai paleisti garso:", err);
        });
      }
    };

  // Memoize the action handler to prevent unnecessary re-renders of BlackjackGame
  const handlePlayerAction = useCallback((action: { actionType: string; payload?: any }) => {
    if (socketRef.current && roomId) {
      console.log(`[Client] Emitting Action: ${action.actionType}`, action.payload || '');
      socketRef.current.emit('player_action', { roomId, ...action });
      setError(null); // Clear previous errors on new action
    } else {
      console.error("Cannot send action: Socket not connected or roomId missing.");
      setError("Connection error. Cannot perform action.");
    }
  }, [roomId]); // Dependency array includes roomId

  useEffect(() => {
    if (!roomId) {
      setError("Room ID is missing.");
      setIsLoading(false);
      navigate('/playchoose', { replace: true, state: { error: 'Room ID is missing' } });
      return;
    }

    // Initialize socket connection
    // Ensure this URL points to your backend server where Socket.IO is running
    const getAuthToken = (): string | null => {
      // Retrieve the token from localStorage (or your preferred storage)
      // Key "token" must match the key used in Login.tsx (localStorage.setItem("token", res.token))
      return localStorage.getItem('token'); 
    };

    socketRef.current = io(API_BASE_URL, {
      auth: {
        token: getAuthToken()
      }
    });
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log(`🔗 Connected to WebSocket server with ID: ${socket.id}`);
      setMyPlayerId(socket.id); // Store our own ID
      socket.emit('join_room_socket', { roomId }); // Send roomId to backend
      // setIsLoading(false); // Loading stops when we get the first game state
    });

    // Listen for the full game state
    socket.on('game_state_update', (newState: BlackjackGameState) => {
      console.log('📢 Game State Update Received:', newState);
      setGameState(newState);
      setIsLoading(false); // Stop loading once we have state
    });

    // Listen for phase changes (might contain extra info like current player)
    // Listen for phase changes (might contain extra info like current player)
    socket.on('game_phase_change', (data: { phase: GamePhase; message?: string; currentPlayerTurn?: string }) => { // Use GamePhase type
        console.log(`🚀 Phase Change: ${data.phase}`, data.message || '', data.currentPlayerTurn ? `Turn: ${data.currentPlayerTurn}` : '');
        // Update phase and current player directly if provided, otherwise rely on game_state_update
        setGameState(prevState => {
            if (!prevState) return null;
            return {
                ...prevState,
                gamePhase: data.phase,
                currentPlayerTurn: data.currentPlayerTurn !== undefined ? data.currentPlayerTurn : prevState.currentPlayerTurn
            };
        });
    });

    socket.on('player_joined', (data: { playerId: string, players: Record<string, PlayerGameState>, playerCount: number }) => { // Type players correctly
      console.log(`➕ Player ${data.playerId} joined. Total players: ${data.playerCount}`);
      // The game_state_update should handle adding the player visually
    });

    socket.on('player_left_game', (data: { playerId: string, playerName: string }) => {
      console.log(`➖ Player ${data.playerName} (${data.playerId}) left.`);
      // The game_state_update should handle removing the player visually
    });

    socket.on('action_error', (data: { action: string, message: string }) => {
        console.error(`🎬 Action Error (${data.action}): ${data.message}`);
        setError(`Action Failed: ${data.message}`); // Show error to user
        // Clear error after a delay?
        setTimeout(() => setError(null), 5000);
    });

    socket.on('error_joining_room', (errorMessage: string) => {
      console.error('Error joining room:', errorMessage);
      setError(errorMessage);
      socket.disconnect();
      // Optionally navigate away or show a persistent error
      // navigate('/playchoose', { replace: true, state: { error: errorMessage } });
    });

    // Listen for authentication errors from the server
    socket.on('auth_error', (errorMessage: string) => {
      console.error('Authentication Error:', errorMessage);
      setError(`Authentication Failed: ${errorMessage}. Please log in again.`);
      // Potentially redirect to login or disable game interactions
      // You might want to clear any stored token if it's deemed invalid by the server
      localStorage.removeItem('token'); // Use the correct key "token" here as well
      navigate('/login', { replace: true, state: { error: 'Authentication failed, please log in.' } });
    });

    socket.on('disconnect', (reason: Socket.DisconnectReason) => { // Type was already fixed here, just ensuring consistency
      console.log(`🔌 Disconnected from WebSocket: ${reason}`);
      // Handle disconnection, e.g., show message, attempt reconnect
      setError(`Disconnected: ${reason}. Attempting to reconnect...`); // Inform user
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
      }
    });

    // Cleanup on component unmount
    return () => {
      if (socket) {
        console.log('🧹 Cleaning up socket connection...');
        socket.emit('leave_room_socket', { roomId }); // Notify server
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, navigate]);

  if (isLoading) {
    return <div className="page_Container"><h1>Connecting to Room {roomId}...</h1></div>;
  }

  if (error) {
    return (
      <div className="page_Container">
        <h1>Error Connecting to Room</h1>
        <p>{error}</p>
        <button className="menu-btn" onClick={() => navigate('/playchoose')}>Back to Lobby</button>
      </div>
    );
  }

  // --- Render Logic ---
  // Remove specific render functions like renderBettingControls, renderPlayerControls, renderGameState
  // The BlackjackGame component will handle rendering based on the gameState prop

  return (
    // Keep the outer container if needed, or let BlackjackGame handle the full screen
    <div className="page_Container" style={{ /* Adjust styling if needed */ }}>
      {/* Optional: Display Room ID or connection status outside the game component */}
      {/* <h1 className="title">Game Room: {roomId}</h1> */}
      {error && <div style={{ color: 'red', padding: '10px', textAlign: 'center' }}>Error: {error}</div>}

      {isLoading && !gameState && <div><h1>Connecting to Room {roomId}...</h1></div>}

      {!isLoading && gameState && (
        <BlackjackGame
          gameState={gameState}
          myPlayerId={myPlayerId}
          roomId={roomId} // Pass roomId if BlackjackGame needs it (e.g., for display)
          onPlayerAction={handlePlayerAction}
        />
      )}

      {/* Keep the Leave button accessible */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
        <button className="menu-btn" onClick={() => navigate('/playchoose')}>Leave Room</button>
      </div>
      <div style={{ position: 'absolute', top: '10px', left: '10px'}}>
      <button onClick={startMusic}>Background Music</button>
      </div>
    </div>
  );
};

export default Room;
