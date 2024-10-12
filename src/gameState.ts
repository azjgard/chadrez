import { Board, IGameState, IPosition, posToKey } from "./lib";
import * as Pieces from "./pieces";

// need to assume that white is always on top, black is always on bottom
// can rotate the view if needed but this simplifies the move logic significantly
export const DEFAULT_BOARD: Board = [
  ["R", "N", "B", " ", "Q", "B", "N", "R"],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", "K", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["r", "n", "b", "k", "q", "b", "n", "r"],
];

export function getInitialGameState(board: Board = DEFAULT_BOARD) {
  let gameState: IGameState = {
    player: "w",
    selectedSquare: null,
    validMovesFromPosition: new Map(),
    board,
    capturedPieces: { w: [], b: [] },
  };

  gameState = applyMoveTurnToGameState(gameState, null);

  return gameState;
}

export function applyMoveTurnToGameState(
  gameState: IGameState,
  moveTo: IPosition | null // passed as null when computing initial gameState
): IGameState {
  const newBoard = [...gameState.board];
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

  for (let r = 0; r < newGameState.board.length; r++) {
    for (let c = 0; c < newGameState.board[r].length; c++) {
      const maybePieceInfo = Pieces.maybeGetPiece(newGameState.board[r][c]);
      if (!maybePieceInfo) continue;

      const key = posToKey({ r, c });
      newGameState.validMovesFromPosition.set(
        key,
        maybePieceInfo.piece(newGameState.board, { r, c })
      );
    }
  }

  return newGameState;
}
