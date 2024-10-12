import * as Pieces from ".";
import { Board, IPosition, posToKey } from "../lib";
import { createPieceHelpers, createPotentialMoves } from "./lib";

export function King(board: Board, pos: IPosition): Set<string> {
  const { player } = Pieces.getPiece(board[pos.r][pos.c]);
  const helpers = createPieceHelpers(board, player);

  // TODO: disallow the king from moving into check, will require changing valid move
  // computation to always do both sides at once
  const possibleMoves = createPotentialMoves(board, pos, [
    { r: pos.r - 1, c: pos.c },
    { r: pos.r - 1, c: pos.c + 1 },
    { r: pos.r, c: pos.c + 1 },
    { r: pos.r + 1, c: pos.c + 1 },
    { r: pos.r + 1, c: pos.c },
    { r: pos.r + 1, c: pos.c - 1 },
    { r: pos.r, c: pos.c - 1 },
    { r: pos.r - 1, c: pos.c - 1 },
  ]).filter((p) => !helpers.isFriendlyPiece(p));

  return new Set(possibleMoves.map(posToKey));
}
