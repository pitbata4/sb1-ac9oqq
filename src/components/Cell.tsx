import React from 'react';
import { Position, Player } from '../models/GameState';

interface CellProps {
  x: number;
  y: number;
  hasWall: boolean;
  players: Player[];
  artifact: Position;
  isValidMove: boolean;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ x, y, hasWall, players, artifact, isValidMove, onClick }) => {
  const player = players.find(p => p.position.x === x && p.position.y === y);
  const hasArtifact = artifact.x === x && artifact.y === y;

  return (
    <div
      onClick={onClick}
      className={`
        w-12 h-12 flex items-center justify-center rounded
        ${hasWall ? 'bg-purple-800' : 'bg-purple-100'}
        ${isValidMove ? 'ring-2 ring-green-400' : ''}
        cursor-pointer hover:opacity-90 transition-opacity
      `}
    >
      {player && (
        <div
          className="w-8 h-8 rounded-full"
          style={{ backgroundColor: player.color }}
        />
      )}
      {hasArtifact && !player && (
        <div className="w-6 h-6 bg-yellow-400 rounded-lg animate-pulse" />
      )}
    </div>
  );
};

export default Cell;