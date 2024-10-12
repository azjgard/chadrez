import * as Pieces from ".";
import { Board, IPosition, posToKey } from "../lib";
import { createPieceHelpers, createPotentialMoves } from "./lib";

export function Pawn(
  board: Board,
  pos: IPosition,
  positionsTargetingPos?: IPosition[]
): Set<string> {
  const { player } = Pieces.getPiece(board[pos.r][pos.c]);

  const helpers = createPieceHelpers(board, player);
  const boardSize = board.length;
  const generatePositions = helpers.createPositionsGenerator(pos, 2, boardSize);
  const pawnDirection = player === "w" ? 1 : -1;
  const pawnStartingRow = player === "w" ? 1 : board.length - 2;

  const forward = createPotentialMoves(
    board,
    pos,
    generatePositions(pawnDirection, 0),
    positionsTargetingPos
  ).filter((p, i) => {
    if (helpers.isPiece(p)) return false;
    // pawn-specific behavior:
    // can't move 2 squares unless pawn is on starting row
    if (i === 1 && pos.r !== pawnStartingRow) {
      return false;
    }
    return true;
  });

  const diagonal = createPotentialMoves(
    board,
    pos,
    [
      { r: pos.r + pawnDirection, c: pos.c + 1 },
      { r: pos.r + pawnDirection, c: pos.c - 1 },
    ],
    positionsTargetingPos
  ).filter((p) => {
    const maybePiece = Pieces.maybeGetPiece(board[p.r][p.c]);

    // can only move diagonal if there's an enemy piece in the diagonal square
    return maybePiece && maybePiece.player !== player;
  });

  return new Set([...forward, ...diagonal].map(posToKey));
}
