import * as Pieces from ".";
import { Color, IPosition, posOnBoard } from "../lib";

export function createPieceHelpers(
  board: Pieces.PieceSymbol[][],
  player: Color
) {
  const isPiece = (p: IPosition) => Pieces.isNonEmptySymbol(board[p.r][p.c]);

  const isEnemyPiece = (p: IPosition) => {
    const maybePiece = Pieces.maybeGetPiece(board[p.r][p.c]);
    return maybePiece && maybePiece.player !== player;
  };

  const isFriendlyPiece = (p: IPosition) => {
    const maybePiece = Pieces.maybeGetPiece(board[p.r][p.c]);
    return maybePiece && maybePiece.player === player;
  };

  const createPositionsGenerator =
    (position: IPosition, steps: number, boardSize: number) =>
    (rowDirection: number, columnDirection: number) => {
      let hasSeenEnemyPiece = false;

      return stepPositions(
        position,
        rowDirection,
        columnDirection,
        steps,
        (position) => {
          if (hasSeenEnemyPiece || !posOnBoard(position, boardSize)) {
            return false;
          }

          if (isEnemyPiece(position)) {
            hasSeenEnemyPiece = true;
            return true;
          }

          return !isFriendlyPiece(position);
        }
      );
    };

  return {
    isPiece,
    isEnemyPiece,
    isFriendlyPiece,
    createPositionsGenerator,
  };
}

function stepPositions(
  p: IPosition,
  rDir: number,
  cDir: number,
  steps: number,
  isValid: (p: IPosition) => boolean
) {
  const positions: IPosition[] = [];
  for (let i = 1; i < 1 + steps; i++) {
    const position = { r: p.r + rDir * i, c: p.c + cDir * i };
    if (!isValid(position)) {
      break;
    }
    positions.push(position);
  }
  return positions;
}

export function createPotentialMoves(moves: IPosition[], boardSize: number) {
  return moves.filter((pos) => posOnBoard(pos, boardSize));
}
