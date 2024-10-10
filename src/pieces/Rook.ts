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

      const boardSize = gameState.board.length;

      const generatePositions = helpers.createPositionsGenerator(
        position,
        8,
        boardSize
      );

      const possibleMoves = createPotentialMoves(
        [
          ...generatePositions(-1, 0),
          ...generatePositions(0, 1),
          ...generatePositions(1, 0),
          ...generatePositions(0, -1),
        ],
        boardSize
      );

      return new Set(possibleMoves.map(posToKey));
    },
  };
}
