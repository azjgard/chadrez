import * as Pieces from ".";
import { Board, IPosition, posToKey } from "../lib";
import { createPieceHelpers, createPotentialMoves } from "./lib";

export function Rook(board: Board, pos: IPosition): Set<string> {
  const { player } = Pieces.getPiece(board[pos.r][pos.c]);
  const helpers = createPieceHelpers(board, player);

  const boardSize = board.length;

  const generatePositions = helpers.createPositionsGenerator(pos, 8, boardSize);

  const possibleMoves = createPotentialMoves(board, pos, [
    ...generatePositions(-1, 0),
    ...generatePositions(0, 1),
    ...generatePositions(1, 0),
    ...generatePositions(0, -1),
  ]);

  return new Set(possibleMoves.map(posToKey));
}
