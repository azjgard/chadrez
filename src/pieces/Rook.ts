import { IPiece, posToKey } from "../lib";
import {
  createPieceHelpers,
  createPotentialMoves,
  usePieceBaseProperties,
} from "./lib";

export function Rook(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "rook",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);

      const generatePositions = helpers.createPositionsGenerator(position, 8);

      const possibleMoves = createPotentialMoves([
        ...generatePositions(-1, 0),
        ...generatePositions(0, 1),
        ...generatePositions(1, 0),
        ...generatePositions(0, -1),
      ]);

      return new Set(possibleMoves.map(posToKey));
    },
  };
}
