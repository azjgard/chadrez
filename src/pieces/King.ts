import * as Pieces from ".";
import { Board, IPosition, posToKey } from "../lib";
import { createPieceHelpers, createPotentialKingMoves } from "./lib";

export function King(
  board: Board,
  pos: IPosition,
  positionsTargetingPos?: Record<string, IPosition[]>
): Set<string> {
  const { player } = Pieces.getPiece(board[pos.r][pos.c]);
  const helpers = createPieceHelpers(board, player);

  const possibleMoves = createPotentialKingMoves(
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
  ).filter((p) => !helpers.isFriendlyPiece(p));

  return new Set(possibleMoves.map(posToKey));
}
