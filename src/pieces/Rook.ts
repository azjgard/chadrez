import * as Pieces from ".";
import { posToKey } from "../lib";
import { createPieceHelpers, createPotentialMoves } from "./lib";

export const Rook: Pieces.PieceFunction = (
  board,
  pos,
  filter,
  positionsTargetingPos
) => {
  const { player } = Pieces.getPiece(board[pos.r][pos.c]);
  const helpers = createPieceHelpers(board, player);

  const boardSize = board.length;

  const generatePositions = helpers.createPositionsGenerator(pos, 8, boardSize);

  const possibleMoves = createPotentialMoves(
    board,
    pos,
    [
      ...generatePositions(-1, 0),
      ...generatePositions(0, 1),
      ...generatePositions(1, 0),
      ...generatePositions(0, -1),
    ],
    filter,
    positionsTargetingPos
  );

  return new Set(possibleMoves.map(posToKey));
};
