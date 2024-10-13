import * as Pieces from ".";
import { posToKey } from "../lib";
import { createPieceHelpers, createPotentialMoves } from "./lib";

export const Queen: Pieces.PieceFunction = (
  board,
  pos,
  filter,
  positionsTargetingPos
) => {
  const { player } = Pieces.getPiece(board[pos.r][pos.c]);
  const helpers = createPieceHelpers(board, player);

  const generatePositions = helpers.createPositionsGenerator(
    pos,
    8,
    board.length,
    filter === "capture"
  );

  const possibleMoves = createPotentialMoves(
    board,
    pos,
    [
      // the moves of a rook
      ...generatePositions(-1, 0),
      ...generatePositions(0, 1),
      ...generatePositions(1, 0),
      ...generatePositions(0, -1),
      // + the moves of a bishop
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
