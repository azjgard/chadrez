import { IPiece, posToKey } from "../lib";
import {
  createPieceHelpers,
  createPotentialMoves,
  usePieceBaseProperties,
} from "./lib";

export function Pawn(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "pawn",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);

      const boardSize = gameState.board.length;
      const generatePositions = helpers.createPositionsGenerator(
        position,
        2,
        boardSize
      );

      const pawnDirection = base.getPlayer() === "w" ? 1 : -1;
      const pawnStartingRow =
        base.getPlayer() === "w" ? 1 : gameState.board.length - 2;

      const forward = createPotentialMoves(
        // pawn-specific behavior:
        // locked move direction according to color
        generatePositions(pawnDirection, 0),
        boardSize
      ).filter((p, i) => {
        if (helpers.isPiece(p)) return false;

        // pawn-specific behavior:
        // can't move 2 squares unless pawn is on starting row
        if (i === 1 && position.r !== pawnStartingRow) {
          return false;
        }

        return true;
      });

      const diagonal = createPotentialMoves(
        [
          { r: position.r + pawnDirection, c: position.c + 1 },
          { r: position.r + pawnDirection, c: position.c - 1 },
        ],
        boardSize
      ).filter((p) => {
        const pieceOnSquare = gameState.board[p.r][p.c];

        // can only move diagonal if there's an enemy piece in the diagonal square
        return pieceOnSquare && pieceOnSquare.getPlayer() !== base.getPlayer();
      });

      return new Set([...forward, ...diagonal].map(posToKey));
    },
  };
}
