import { Board, BoardMethods, IGameState, IPosition, posToKey } from "./lib";
import * as Pieces from "./pieces";

// need to assume that white is always on top, black is always on bottom
// can rotate the view if needed but this simplifies the move logic significantly
export const DEFAULT_BOARD = createBoard([
  ["R", "N", "B", " ", "Q", "B", "N", "R"],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", "K", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["r", "n", "b", "k", "q", "b", "n", "r"],
]);

export function createBoard(board: Pieces.PieceSymbol[][]): Board {
  const arr = JSON.parse(JSON.stringify(board));

  const methods: BoardMethods = {
    // TODO: refactor this so that it uses properties cached on the board instead of always having
    // to re-compute
    getKingPosition: (player) => {
      for (let r = 0; r < arr.length; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          const piece = Pieces.maybeGetPiece(arr[r][c]);
          if (piece?.name === "king" && piece.player === player) {
            return { r, c };
          }
        }
      }
      throw new Error("Couldn't get king position");
    },
  };

  Object.assign(arr, methods);

  return arr as Board;
}

export function getInitialGameState(
  board: Pieces.PieceSymbol[][] = DEFAULT_BOARD
) {
  let gameState: IGameState = {
    player: "w",
    selectedSquare: null,
    validMovesFromPosition: new Map(),
    board: createBoard(board),
    capturedPieces: { w: [], b: [] },
  };

  gameState = applyMoveTurnToGameState(gameState, null);

  return gameState;
}

export function applyMoveTurnToGameState(
  gameState: IGameState,
  moveTo: IPosition | null // passed as null when computing initial gameState
): IGameState {
  const newBoard = createBoard(gameState.board);
  const newPlayer = moveTo ? (gameState.player === "w" ? "b" : "w") : "w";
  const newCapturedPieces = { ...gameState.capturedPieces };

  const { selectedSquare } = gameState;

  if (moveTo && !selectedSquare) {
    throw new Error("Cannot move while applying turn without a selected piece");
  }

  // handles capturing
  if (moveTo && selectedSquare) {
    const moveIsValid = gameState.validMovesFromPosition
      .get(posToKey(selectedSquare))
      ?.has(posToKey(moveTo));

    if (!moveIsValid) {
      throw new Error("Invalid move");
    }

    const symbolSelected = newBoard[selectedSquare.r][selectedSquare.c];
    if (!symbolSelected) {
      throw new Error("Invalid selected piece position");
    }

    const symbolCaptured = newBoard[moveTo.r][moveTo.c];
    if (symbolCaptured !== " ") {
      newCapturedPieces[newPlayer].push(symbolCaptured);
    }

    // move piece to new square
    newBoard[selectedSquare.r][selectedSquare.c] = " ";
    newBoard[moveTo.r][moveTo.c] = symbolSelected;

    // TODO: edge cases with side effects:
    // - en passant
    // - castling
    // - converting a pawn

    // TODO: compute whether or not king is now in check or checkmate
    //

    // TODO: each piece needs to filter moves by whether or not a given move puts their own king in check
  }

  const newGameState: IGameState = {
    board: newBoard,
    validMovesFromPosition: new Map(),
    selectedSquare: null,
    player: newPlayer,
    capturedPieces: newCapturedPieces,
  };

  const forEachSquare = (cb: (pos: IPosition) => void) => {
    for (let r = 0; r < newGameState.board.length; r++) {
      for (let c = 0; c < newGameState.board[r].length; c++) {
        cb({ r, c });
      }
    }
  };

  const positionsTargetingPos: Record<string, IPosition[]> = {};
  forEachSquare((p) => {
    const maybePiece = Pieces.maybeGetPiece(newGameState.board[p.r][p.c]);
    if (!maybePiece) return;

    const validMoves = maybePiece.piece(newGameState.board, p);
    validMoves.forEach((pos) => {
      positionsTargetingPos[pos] ??= [];
      positionsTargetingPos[pos].push(p);
    });
  });

  forEachSquare((p) => {
    const maybePiece = Pieces.maybeGetPiece(newGameState.board[p.r][p.c]);
    if (!maybePiece) return;

    const key = posToKey(p);
    const validMoves = maybePiece.piece(
      newGameState.board,
      p,
      positionsTargetingPos[key]
    );

    newGameState.validMovesFromPosition.set(key, validMoves);
  });

  return newGameState;
}
