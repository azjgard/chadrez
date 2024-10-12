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
    (
      position: IPosition,
      steps: number,
      boardSize: number,
      // if this flag is set to true, the generator will include the first position that is occupied by a friendly piece
      // in the list of returned positions. this is useful for collecting valid capture positions vs valid move positions.
      includeFriendlyPieces?: boolean
    ) =>
    (rowDirection: number, columnDirection: number) => {
      let shouldBreak = false;

      return stepPositions(
        position,
        rowDirection,
        columnDirection,
        steps,
        (position) => {
          if (shouldBreak || !posOnBoard(position, boardSize)) {
            return false;
          }

          if (isEnemyPiece(position)) {
            shouldBreak = true;
            return true;
          }

          if (isFriendlyPiece(position)) {
            if (includeFriendlyPieces) {
              shouldBreak = true;
              return true;
            } else {
              return false;
            }
          }

          return true;
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
  filter: "move" | "capture",
  positionsTargetingPos: Record<string, IPosition[]> = {}
) {
  const symbol = board[pos.r][pos.c];
  const { player } = Pieces.getPiece(symbol);

  const kingPos = board.getKingPosition(player);
  if (!kingPos) return []; // we've been asked to create potential moves for a board in which the king would be captured
  const kingPosKey = posToKey(kingPos);

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
        for (const p of positionsTargetingPos[posToKey(pos)] ?? []) {
          const symbol = board[p.r][p.c];

          // if the targeting piece is on our team, continue
          const pieceInfo = Pieces.getPiece(symbol);
          if (pieceInfo.player === player) continue;

          // compute potential moves for the targeting piece on a board where our piece has moved
          const piecePotentialMoves = pieceInfo.piece(b, p, filter);
          if (piecePotentialMoves.has(kingPosKey)) {
            return false;
          }
        }

        return true;
      })
  );
}

export function createPotentialKingMoves(
  board: Board,
  pos: IPosition,
  potentialMoves: IPosition[],
  positionsTargetingPos: Record<string, IPosition[]> = {}
) {
  const symbol = board[pos.r][pos.c];
  const { player } = Pieces.getPiece(symbol);

  return (
    potentialMoves
      // filter out positions that are not on the board
      .filter((potentialPos) => posOnBoard(potentialPos, board.length))
      // filter out positions that are occupied by friendly pieces
      .filter((potentialPos) => {
        const potentialPosKey = posToKey(potentialPos);
        // TODO:
        // there's going to be a bug where the king is going to be allowed to take pieces and move into check by doing
        // so because for all pieces we're going to filter out moves that would move them into their own friendly piece
        // squares, which in so doing means that we're not going to have those squares as potential move targets. need
        // to tweak initial pass to not filter out friendly pieces from potential move targets.

        // return false if any enemy pieces targeting this potential new position for the king
        for (const p of positionsTargetingPos[potentialPosKey] ?? []) {
          const symbol = board[p.r][p.c];
          const pieceInfo = Pieces.getPiece(symbol);

          if (pieceInfo.player !== player) {
            return false;
          }
        }

        return true;
      })
  );
}
