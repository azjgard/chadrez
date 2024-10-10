import { IPiece, posToKey } from "../lib";
import {
  createPieceHelpers,
  createPotentialMoves,
  usePieceBaseProperties,
} from "./lib";

export function Bishop(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "bishop",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);

      const boardSize = gameState.board.length;

      const generatePositions = helpers.createPositionsGenerator(
        position,
        boardSize,
        boardSize
      );
      const possibleMoves = createPotentialMoves(
        [
          ...generatePositions(-1, 1),
          ...generatePositions(1, 1),
          ...generatePositions(1, -1),
          ...generatePositions(-1, -1),
        ],
        boardSize
      );

      return new Set(possibleMoves.map(posToKey));
    },
  };
}
