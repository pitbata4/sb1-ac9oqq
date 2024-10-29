import React, { useEffect } from 'react';
import { useGameStore } from '../models/GameState';
import Cell from './Cell';

const GameBoard: React.FC = () => {
  const { 
    board,
    players,
    currentPlayer,
    artifact,
    currentMoves,
    validMoves,
    initializeGame,
    movePlayer,
    rollDie,
    nextTurn,
    hasWinner
  } = useGameStore();

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCellClick = (x: number, y: number) => {
    if (currentMoves === 0) return;

    const isValidMove = validMoves.some(move => move.x === x && move.y === y);
    if (isValidMove) {
      const moveSuccessful = movePlayer(currentPlayer, { x, y });
      
      if (moveSuccessful && currentMoves === 0) {
        const winner = hasWinner();
        if (winner) {
          alert(`Player ${winner.id + 1} wins!`);
          initializeGame();
        } else {
          nextTurn();
        }
      }
    }
  };

  const isValidMove = (x: number, y: number) => {
    return validMoves.some(move => move.x === x && move.y === y);
  };

  if (!board.length) return null;

  return (
    <div className="flex flex-col items-center min-h-screen bg-purple-50 p-4">
      <div className="bg-purple-800 text-white w-full p-4 mb-4 rounded-lg">
        <h1 className="text-2xl text-center">Magic Labyrinth</h1>
        <div className="flex justify-between mt-2">
          <span>Current Player: {currentPlayer + 1}</span>
          <span>
            Artifacts: P1({players[0]?.artifacts}) P2({players[1]?.artifacts})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1 bg-purple-200 p-2 rounded-lg">
        {board.map((row, y) =>
          row.map((hasWall, x) => (
            <Cell
              key={`${x}-${y}`}
              x={x}
              y={y}
              hasWall={hasWall}
              players={players}
              artifact={artifact}
              isValidMove={isValidMove(x, y)}
              onClick={() => handleCellClick(x, y)}
            />
          ))
        )}
      </div>

      <div className="mt-4 flex gap-4 items-center">
        <button
          onClick={() => currentMoves === 0 && rollDie()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          disabled={currentMoves > 0}
        >
          Roll Die
        </button>
        <span className="text-xl">Moves: {currentMoves}</span>
      </div>
    </div>
  );
};

export default GameBoard;