import { Observable } from '@nativescript/core';

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

export class GameState extends Observable {
  private readonly BOARD_SIZE = 8;
  private readonly WALL_PROBABILITY = 0.2;
  
  board: boolean[][];
  players: Player[];
  currentPlayer: number;
  artifact: Position;
  
  constructor() {
    super();
    this.initializeGame();
  }

  private initializeGame() {
    // Initialize board with invisible walls
    this.board = Array(this.BOARD_SIZE).fill(null)
      .map(() => Array(this.BOARD_SIZE).fill(false)
        .map(() => Math.random() < this.WALL_PROBABILITY));

    // Initialize players
    this.players = [
      { id: 0, color: '#FF4136', position: { x: 0, y: 0 }, artifacts: 0, startPosition: { x: 0, y: 0 } },
      { id: 1, color: '#0074D9', position: { x: 7, y: 7 }, artifacts: 0, startPosition: { x: 7, y: 7 } }
    ];

    this.currentPlayer = 0;
    this.spawnArtifact();
  }

  private spawnArtifact() {
    do {
      this.artifact = {
        x: Math.floor(Math.random() * this.BOARD_SIZE),
        y: Math.floor(Math.random() * this.BOARD_SIZE)
      };
    } while (this.board[this.artifact.y][this.artifact.x]);
  }

  movePlayer(playerId: number, newPosition: Position): boolean {
    const player = this.players[playerId];
    
    // Check if move is valid
    if (this.board[newPosition.y][newPosition.x]) {
      // Hit wall, return to start
      player.position = { ...player.startPosition };
      return false;
    }

    player.position = newPosition;

    // Check for artifact collection
    if (newPosition.x === this.artifact.x && newPosition.y === this.artifact.y) {
      player.artifacts++;
      this.spawnArtifact();
    }

    return true;
  }

  rollDie(): number {
    const dieValues = [1, 2, 2, 3, 3, 4];
    return dieValues[Math.floor(Math.random() * dieValues.length)];
  }

  nextTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  }

  hasWinner(): Player | null {
    return this.players.find(p => p.artifacts >= 5) || null;
  }
}