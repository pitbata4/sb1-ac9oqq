import { EventData, GridLayout, ItemSpec, Observable, Screen } from '@nativescript/core';
import { GameState } from '../models/game-state';

export class GameBoardViewModel extends Observable {
  private gameState: GameState;
  currentMoves: number = 0;

  constructor() {
    super();
    this.gameState = new GameState();
  }

  onBoardLoaded(args: EventData) {
    const board = args.object as GridLayout;
    const size = Math.min(Screen.mainScreen.widthDIPs, Screen.mainScreen.heightDIPs) - 40;
    const cellSize = size / 8;

    // Set up grid
    for (let i = 0; i < 8; i++) {
      board.addRow(new ItemSpec(1, "star"));
      board.addColumn(new ItemSpec(1, "star"));
    }

    // Create cells
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const cell = new GridLayout();
        cell.className = 'border border-gray-300 bg-purple-100';
        cell.width = cellSize;
        cell.height = cellSize;

        // Add tap handler
        cell.on('tap', () => this.onCellTap(x, y));

        GridLayout.setColumn(cell, x);
        GridLayout.setRow(cell, y);
        board.addChild(cell);
      }
    }

    this.updateBoard();
  }

  onRollDie() {
    if (this.currentMoves === 0) {
      this.currentMoves = this.gameState.rollDie();
      this.notifyPropertyChange('currentMoves', this.currentMoves);
    }
  }

  private onCellTap(x: number, y: number) {
    if (this.currentMoves === 0) return;

    const player = this.gameState.players[this.gameState.currentPlayer];
    const distance = Math.abs(x - player.position.x) + Math.abs(y - player.position.y);

    if (distance <= this.currentMoves) {
      if (this.gameState.movePlayer(this.gameState.currentPlayer, { x, y })) {
        this.currentMoves = 0;
        this.gameState.nextTurn();
        this.updateBoard();
      }
    }
  }

  private updateBoard() {
    // Update UI to reflect game state
    this.notifyPropertyChange('currentPlayer', this.gameState.currentPlayer);
    this.notifyPropertyChange('players', this.gameState.players);
    
    const winner = this.gameState.hasWinner();
    if (winner) {
      alert(`Player ${winner.id + 1} wins!`);
      this.gameState = new GameState();
    }
  }
}