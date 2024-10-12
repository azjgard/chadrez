import * as Pieces from ".";
import { posToKey } from "../lib";
import { createPieceHelpers, createPotentialMoves } from "./lib";

export const Bishop: Pieces.PieceFunction = (
  board,
  pos,
  filter,
  positionsTargetingPos
) => {
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
    filter,
    positionsTargetingPos
  );

  return new Set(possibleMoves.map(posToKey));
};
