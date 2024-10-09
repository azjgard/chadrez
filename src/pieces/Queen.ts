import { IPiece, posToKey } from "../lib";
import {
  createPieceHelpers,
  createPotentialMoves,
  usePieceBaseProperties,
} from "./lib";

export function Queen(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "queen",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);

      const generatePositions = helpers.createPositionsGenerator(position, 8);
      const possibleMoves = createPotentialMoves([
        // the moves of a rook
        ...generatePositions(-1, 0),
        ...generatePositions(0, 1),
        ...generatePositions(1, 0),
        ...generatePositions(0, -1),
        // + the moves of a bishop
        ...generatePositions(-1, 1),
        ...generatePositions(1, 1),
        ...generatePositions(1, -1),
        ...generatePositions(-1, -1),
      ]);

      return new Set(possibleMoves.map(posToKey));
    },
  };
}
