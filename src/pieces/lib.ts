import * as Pieces from ".";
import { createBoard } from "../gameState";
import { Board, Color, IPosition, posOnBoard, posToKey } from "../lib";

export function createPieceHelpers(board: Board, player: Color) {
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

export function createPotentialMoves(
  board: Board,
  pos: IPosition,
  potentialMoves: IPosition[],
  piecePositionsTargetingPos: IPosition[] = []
) {
  const symbol = board[pos.r][pos.c];
  const { player } = Pieces.getPiece(symbol);
  const kingPosKey = posToKey(board.getKingPosition(player));

  return (
    potentialMoves
      // filter out positions that are not on the board
      .filter((potentialPos) => posOnBoard(potentialPos, board.length))
      // filter out positions that are occupied by friendly pieces
      .filter((potentialPos) => {
        // mock the board with the move applied
        const b = createBoard(board);
        b[potentialPos.r][potentialPos.c] = symbol;
        b[pos.r][pos.c] = " ";

        // for each piece targeting the current position of our piece
        for (const p of piecePositionsTargetingPos) {
          const symbol = board[p.r][p.c];
          const pieceInfo = Pieces.getPiece(symbol);

          // compute potential moves for the targeting piece on a board where our piece has moved
          const piecePotentialMoves = pieceInfo.piece(b, p);
          if (piecePotentialMoves.has(kingPosKey)) {
            return false;
          }
        }

        return true;
      })
  );
}
