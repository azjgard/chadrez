import * as Pieces from ".";
import { posToKey } from "../lib";
import { createPieceHelpers, createPotentialKingMoves } from "./lib";

export const King: Pieces.PieceFunction = (
  board,
  pos,
  filter,
  positionsTargetingPos
) => {
  const { player } = Pieces.getPiece(board[pos.r][pos.c]);
  const helpers = createPieceHelpers(board, player);

  let possibleMoves = createPotentialKingMoves(
    board,
    pos,
    [
      { r: pos.r - 1, c: pos.c },
      { r: pos.r - 1, c: pos.c + 1 },
      { r: pos.r, c: pos.c + 1 },
      { r: pos.r + 1, c: pos.c + 1 },
      { r: pos.r + 1, c: pos.c },
      { r: pos.r + 1, c: pos.c - 1 },
      { r: pos.r, c: pos.c - 1 },
      { r: pos.r - 1, c: pos.c - 1 },
    ],
    positionsTargetingPos
  );

  if (filter === "move") {
    possibleMoves = possibleMoves.filter((p) => !helpers.isFriendlyPiece(p));
  }

  return new Set(possibleMoves.map(posToKey));
};
