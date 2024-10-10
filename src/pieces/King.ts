import { IPiece, posToKey } from "../lib";
import {
  createPieceHelpers,
  createPotentialMoves,
  usePieceBaseProperties,
} from "./lib";

export function King(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "king",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);
      // TODO: disallow the king from moving into check, will require changing valid move
      // computation to always do both sides at once
      const possibleMoves = createPotentialMoves(
        [
          { r: position.r - 1, c: position.c },
          { r: position.r - 1, c: position.c + 1 },
          { r: position.r, c: position.c + 1 },
          { r: position.r + 1, c: position.c + 1 },
          { r: position.r + 1, c: position.c },
          { r: position.r + 1, c: position.c - 1 },
          { r: position.r, c: position.c - 1 },
          { r: position.r - 1, c: position.c - 1 },
        ],
        gameState.board.length
      ).filter((p) => {
        helpers.isFriendlyPiece(p) || helpers.isTargetableByEnemyPiece(p);
      });

      return new Set(possibleMoves.map(posToKey));
    },
  };
}
