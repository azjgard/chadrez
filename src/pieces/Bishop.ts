import * as Pieces from ".";
import { Board, IPosition, posToKey } from "../lib";
import { createPieceHelpers, createPotentialMoves } from "./lib";

export function Bishop(
  board: Board,
  pos: IPosition,
  positionsTargetingPos?: Record<string, IPosition[]>
): Set<string> {
  const { player } = Pieces.getPiece(board[pos.r][pos.c]);
  const helpers = createPieceHelpers(board, player);

  const boardSize = board.length;

  const generatePositions = helpers.createPositionsGenerator(
    pos,
    boardSize,
    boardSize
  );

  const possibleMoves = createPotentialMoves(
    board,
    pos,
    [
      ...generatePositions(-1, 1),
      ...generatePositions(1, 1),
      ...generatePositions(1, -1),
      ...generatePositions(-1, -1),
    ],
    positionsTargetingPos
  );

  return new Set(possibleMoves.map(posToKey));
}
