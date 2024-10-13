import * as Pieces from ".";
import { posToKey } from "../lib";
import { createPieceHelpers, createPotentialMoves } from "./lib";

export const Knight: Pieces.PieceFunction = (
  board,
  pos,
  filter,
  positionsTargetingPos?
) => {
  const { player } = Pieces.getPiece(board[pos.r][pos.c]);
  const helpers = createPieceHelpers(board, player);

  let possibleMoves = createPotentialMoves(
    board,
    pos,
    [
      { r: pos.r - 2, c: pos.c + 1 },
      { r: pos.r - 1, c: pos.c + 2 },
      { r: pos.r + 1, c: pos.c + 2 },
      { r: pos.r + 2, c: pos.c + 1 },
      { r: pos.r + 2, c: pos.c - 1 },
      { r: pos.r + 1, c: pos.c - 2 },
      { r: pos.r - 1, c: pos.c - 2 },
      { r: pos.r - 2, c: pos.c - 1 },
    ],
    filter,
    positionsTargetingPos
  );

  if (filter === "move") {
    possibleMoves = possibleMoves.filter((p) => !helpers.isFriendlyPiece(p));
  }

  return new Set(possibleMoves.map(posToKey));
};
