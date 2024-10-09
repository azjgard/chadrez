import { IPiece, posToKey } from "../lib";
import {
  createPieceHelpers,
  createPotentialMoves,
  usePieceBaseProperties,
} from "./lib";

export function Knight(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "knight",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);
      const possibleMoves = createPotentialMoves([
        { r: position.r - 2, c: position.c + 1 },
        { r: position.r - 1, c: position.c + 2 },
        { r: position.r + 1, c: position.c + 2 },
        { r: position.r + 2, c: position.c + 1 },
        { r: position.r + 2, c: position.c - 1 },
        { r: position.r + 1, c: position.c - 2 },
        { r: position.r - 1, c: position.c - 2 },
        { r: position.r - 2, c: position.c - 1 },
      ]).filter((p) => !helpers.isFriendlyPiece(p));
      return new Set(possibleMoves.map(posToKey));
    },
  };
}
