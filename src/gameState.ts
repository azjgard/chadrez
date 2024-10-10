import { Board, IGameState, IPiece, IPosition, posToKey } from "./lib";
import * as Pieces from "./pieces";

// need to assume that white is always on top, black is always on bottom
// can rotate the view if needed but this simplifies the move logic significantly
export const DEFAULT_BOARD = Pieces.createBoard([
  ["R", "N", "B", " ", "Q", "B", "N", "R"],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", "K", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["r", "n", "b", "k", "q", "b", "n", "r"],
]);

export function deserializeBoard(boardSymbols: string[][] = DEFAULT_BOARD) {
  const board: IGameState["board"] = [];
  for (let r = 0; r < boardSymbols.length; r++) {
    const row: IGameState["board"][number] = [];
    for (let c = 0; c < boardSymbols[0].length; c++) {
      const symbol = boardSymbols[r][c];
      if (!Pieces.isValidSymbol(symbol)) {
        row.push(null);
        continue;
      }

      const pieceData = Pieces.getSymbol(symbol);
      if (!pieceData) {
        row.push(null);
        continue;
      }

      const [PieceFunction, player] = pieceData;
      row.push(PieceFunction(r, c, player));
    }
    board.push(row);
  }
  return board;
}

export function serializeBoard(board: Board): string[][] {
  const serializedBoard: string[][] = [];

  board.forEach((row) =>
    serializedBoard.push(
      row.map((piece) =>
        piece ? Pieces.getPieceSymbol(piece, piece.getPlayer()) : " "
      )
    )
  );

  return serializedBoard;
}

export function printBoard(board: string[][]) {
  const formattedBoard: string[] = [];
  for (let r = 0; r < board.length; r++) {
    let row = "";
    for (let c = 0; c < board[r].length; c++) {
      const char = board[r][c];
      row += `${char === " " ? "█" : char}` + " ";
    }
    formattedBoard.push(row);
  }
  console.log(formattedBoard.join("\n"));
}

export function getInitialGameState(board: string[][] = DEFAULT_BOARD) {
  let gameState: IGameState = {
    player: "w",
    selectedSquare: null,
    validMovesFromPosition: new Map(),
    board: deserializeBoard(board),
    capturedPieces: { w: [], b: [] },
  };

  gameState = applyMoveTurnToGameState(gameState, null);

  return gameState;
}

export function applyMoveTurnToGameState(
  gameState: IGameState,
  moveTo: IPosition | null // passed as null when computing initial gameState
): IGameState {
  const newBoard: Board = [...gameState.board];
  const newPlayer = moveTo ? (gameState.player === "w" ? "b" : "w") : "w";
  const newCapturedPieces = { ...gameState.capturedPieces };

  const { selectedSquare } = gameState;

  if (moveTo && !selectedSquare) {
    throw new Error("Cannot move while applying turn without a selected piece");
  }

  if (moveTo && selectedSquare) {
    const moveIsValid = gameState.validMovesFromPosition
      .get(posToKey(selectedSquare))
      ?.has(posToKey(moveTo));
    if (!moveIsValid) {
      throw new Error("Invalid move");
    }

    const selectedPiece = newBoard[selectedSquare.r][selectedSquare.c];
    if (!selectedPiece) {
      throw new Error("Invalid selected piece position");
    }

    // track if a piece is being captured
    if (newBoard[moveTo.r][moveTo.c]) {
      newCapturedPieces[newPlayer].push(newBoard[moveTo.r][moveTo.c]!);
    }

    // move piece to new square
    newBoard[selectedSquare.r][selectedSquare.c] = null;
    newBoard[moveTo.r][moveTo.c] = selectedPiece;
    selectedPiece.setPosition(moveTo);

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

  // specific edge case: moves for the king of the new player need to be calculated after ALL other
  // valid moves for all pieces have been calcualted
  let newPlayerKing: IPiece | null = null;

  for (const row of newGameState.board) {
    for (const piece of row) {
      if (!piece) continue;

      if (piece.name === "king" && piece.getPlayer() === newPlayer) {
        newPlayerKing = piece;
        continue;
      }

      const key = posToKey(piece.getPosition());
      newGameState.validMovesFromPosition.set(
        key,
        piece.getValidMovePositions(newGameState)
      );
    }
  }

  if (!newPlayerKing) {
    throw new Error(
      "Processed new game board state without detecting a friendly king"
    );
  }

  newGameState.validMovesFromPosition.set(
    posToKey(newPlayerKing.getPosition()),
    newPlayerKing.getValidMovePositions(newGameState)
  );

  return newGameState;
}
