import { create } from 'zustand';

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: number;
  color: string;
  position: Position;
  artifacts: number;
  startPosition: Position;
}

interface GameState {
  board: boolean[][];
  players: Player[];
  currentPlayer: number;
  artifact: Position;
  currentMoves: number;
  validMoves: Position[];
  initializeGame: () => void;
  movePlayer: (playerId: number, newPosition: Position) => boolean;
  rollDie: () => void;
  nextTurn: () => void;
  hasWinner: () => Player | null;
  calculateValidMoves: () => void;
}

const BOARD_SIZE = 8;
const WALL_PROBABILITY = 0.2;

export const useGameStore = create<GameState>((set, get) => ({
  board: [],
  players: [],
  currentPlayer: 0,
  artifact: { x: 0, y: 0 },
  currentMoves: 0,
  validMoves: [],

  initializeGame: () => {
    const board = Array(BOARD_SIZE).fill(null)
      .map(() => Array(BOARD_SIZE).fill(false)
        .map(() => Math.random() < WALL_PROBABILITY));

    const players = [
      { id: 0, color: '#FF4136', position: { x: 0, y: 0 }, artifacts: 0, startPosition: { x: 0, y: 0 } },
      { id: 1, color: '#0074D9', position: { x: 7, y: 7 }, artifacts: 0, startPosition: { x: 7, y: 7 } }
    ];

    const spawnArtifact = () => {
      let x, y;
      do {
        x = Math.floor(Math.random() * BOARD_SIZE);
        y = Math.floor(Math.random() * BOARD_SIZE);
      } while (board[y][x]);
      return { x, y };
    };

    set({
      board,
      players,
      currentPlayer: Math.floor(Math.random() * 2), // Randomly choose first player
      artifact: spawnArtifact(),
      currentMoves: 0,
      validMoves: []
    });
  },

  calculateValidMoves: () => {
    const { currentPlayer, players, currentMoves, board } = get();
    if (currentMoves === 0) {
      set({ validMoves: [] });
      return;
    }

    const player = players[currentPlayer];
    const validMoves: Position[] = [];
    const { x, y } = player.position;

    // Check adjacent cells (up, right, down, left)
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 1, dy: 0 },  // right
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }  // left
    ];

    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (
        newX >= 0 && newX < BOARD_SIZE &&
        newY >= 0 && newY < BOARD_SIZE
      ) {
        validMoves.push({ x: newX, y: newY });
      }
    }

    set({ validMoves });
  },

  movePlayer: (playerId, newPosition) => {
    const state = get();
    const newPlayers = [...state.players];
    const player = newPlayers[playerId];

    // Check if move is adjacent
    const dx = Math.abs(newPosition.x - player.position.x);
    const dy = Math.abs(newPosition.y - player.position.y);
    if (dx + dy !== 1) {
      return false;
    }

    // Update player position
    player.position = newPosition;

    // Check if hit wall
    if (state.board[newPosition.y][newPosition.x]) {
      player.position = { ...player.startPosition };
      set({ 
        players: newPlayers, 
        currentMoves: 0, 
        validMoves: [] 
      });
      return true;
    }

    // Check for artifact collection
    if (newPosition.x === state.artifact.x && newPosition.y === state.artifact.y) {
      player.artifacts++;
      let newArtifact;
      do {
        newArtifact = {
          x: Math.floor(Math.random() * BOARD_SIZE),
          y: Math.floor(Math.random() * BOARD_SIZE)
        };
      } while (state.board[newArtifact.y][newArtifact.x]);
      
      set({ 
        players: newPlayers, 
        artifact: newArtifact,
        currentMoves: state.currentMoves - 1
      });
    } else {
      set({ 
        players: newPlayers,
        currentMoves: state.currentMoves - 1
      });
    }

    // Calculate new valid moves if there are remaining moves
    if (state.currentMoves > 1) {
      get().calculateValidMoves();
    } else {
      set({ validMoves: [] });
    }

    return true;
  },

  rollDie: () => {
    const dieValues = [1, 2, 2, 3, 3, 4];
    const moves = dieValues[Math.floor(Math.random() * dieValues.length)];
    set({ currentMoves: moves }, false);
    get().calculateValidMoves();
  },

  nextTurn: () => {
    set(state => ({
      currentPlayer: (state.currentPlayer + 1) % state.players.length,
      currentMoves: 0,
      validMoves: []
    }));
  },

  hasWinner: () => {
    const state = get();
    return state.players.find(p => p.artifacts >= 5) || null;
  }
}));