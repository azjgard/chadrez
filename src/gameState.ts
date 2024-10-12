import {
  Board,
  BoardMethods,
  IGameState,
  IPosition,
  keyToPos,
  posToKey,
} from "./lib";
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
    // TODO: use properties cached on the board object instead of always having
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

      // since we compute hypothetical moves, it's possible that the king is not on the board
      // for a given move
      return null;
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
    condition: null,
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
  }

  const newGameState: IGameState = {
    board: newBoard,
    validMovesFromPosition: new Map(),
    selectedSquare: null,
    player: newPlayer,
    capturedPieces: newCapturedPieces,
    condition: null,
  };

  const forEachSquare = (cb: (pos: IPosition) => void | boolean) => {
    for (let r = 0; r < newGameState.board.length; r++) {
      for (let c = 0; c < newGameState.board[r].length; c++) {
        const shouldBreak = cb({ r, c });
        if (shouldBreak) return;
      }
    }
  };

  const positionsTargetingPos: Record<string, IPosition[]> = {};
  forEachSquare((p) => {
    const maybePiece = Pieces.maybeGetPiece(newGameState.board[p.r][p.c]);
    if (!maybePiece) return;

    const validMoves = maybePiece.piece(newGameState.board, p, "capture");
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
      "move",
      positionsTargetingPos
    );

    newGameState.validMovesFromPosition.set(key, validMoves);
  });

  let friendlyKingPos: IPosition | null = null;

  forEachSquare((p) => {
    const maybePiece = Pieces.maybeGetPiece(newGameState.board[p.r][p.c]);
    if (!maybePiece) return;

    if (maybePiece.name === "king" && maybePiece.player === newPlayer) {
      friendlyKingPos = p;
      return true;
    }
  });

  if (!friendlyKingPos) {
    throw new Error("Could not find friendly king");
  }

  const hasValidMoves = Array.from(
    newGameState.validMovesFromPosition.entries()
  )
    .filter(([_pos]) => {
      const pos = keyToPos(_pos);
      const symbol = newGameState.board[pos.r][pos.c];
      const { player } = Pieces.getPiece(symbol);
      return player === newPlayer;
    })
    .some(([, set]) => set.size > 0);

  const inCheck =
    (positionsTargetingPos[posToKey(friendlyKingPos)] || []).filter((pos) => {
      const symbol = newGameState.board[pos.r][pos.c];
      const { player } = Pieces.getPiece(symbol);
      return player !== newPlayer;
    })?.length > 0;

  // I initially thought this would be the case only if the KING didn't
  // have valid moves, but since we're computing the valid moves for all pieces
  // relative to whether or not a given move would end with the friendly king
  // in check, a checkmate scenario is actually one where no piece has any valid
  // moves because all board configurations with possible moves result in the
  // king being targeted by an enemy piece.
  const inCheckmate = inCheck && !hasValidMoves;

  const inStalemate = !inCheck && !hasValidMoves;

  if (inCheckmate) {
    newGameState.condition = "checkmate";
  } else if (inStalemate) {
    newGameState.condition = "stalemate";
  } else if (inCheck) {
    newGameState.condition = "check";
  }

  return newGameState;
}
