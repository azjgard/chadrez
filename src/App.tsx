import { useState, useMemo } from "react";
import classNames from "classnames";
import "./App.css";

import { Color, Piece, defaultPieceImageMap } from "./lib";

function posToKey(pos: IPosition | number, c?: number) {
  if (typeof pos === "number" && typeof c === "number") {
    return +pos + "__" + c;
  }

  if (typeof pos === "object") {
    return +pos.r + "__" + pos.c;
  }

  throw new Error("Invalid posToKey");
}

function keyToPos(pos: string) {
  const [rStr, cStr] = pos.split("__");

  const r = parseInt(rStr);
  if (isNaN(r)) throw new Error("Invalid pos key parsing r: " + pos);

  const c = parseInt(cStr);
  if (isNaN(c)) throw new Error("Invalid pos key parsing c: " + pos);

  return { r, c };
}

function usePieceBaseProperties(position: IPosition, player: Color) {
  let _position = { ...position };
  let _player = player;

  function getPlayer() {
    return _player;
  }

  function setPlayer(p: Color) {
    _player = p;
  }

  function getPosition() {
    return _position;
  }

  function setPosition(p: IPosition) {
    _position = p;
  }

  return {
    getPlayer,
    setPlayer,
    getPosition,
    setPosition,
  };
}

function createPieceHelpers(gameState: IGameState, player: Color) {
  const isTargetableByEnemyPiece = (p: IPosition) => {
    // for each set of enemy valid moves in the move state
    // is targetable if set includes position
    for (const [fromPosKey, positionSet] of Array.from(
      gameState.validMovesFromPosition.entries(),
    )) {
      const fromPos = keyToPos(fromPosKey);
      const piece = gameState.board[fromPos.r][fromPos.c];
      // only check enemy players
      if (!(piece && piece.getPlayer() !== player)) continue;
      if (positionSet.has(posToKey(p))) return true;
    }

    return false;
  };

  const isPiece = (p: IPosition) => !!gameState.board[p.r][p.c];

  const isEnemyPiece = (p: IPosition) =>
    gameState.board[p.r][p.c] &&
    gameState.board[p.r][p.c]!.getPlayer() !== player;

  const isFriendlyPiece = (p: IPosition) =>
    gameState.board[p.r][p.c] &&
    gameState.board[p.r][p.c]!.getPlayer() === player;

  const createPositionsGenerator =
    (position: IPosition, steps: number) =>
    (rowDirection: number, columnDirection: number) => {
      let hasSeenEnemyPiece = false;

      return stepPositions(
        position,
        rowDirection,
        columnDirection,
        steps,
        (position) => {
          if (hasSeenEnemyPiece || !posOnBoard(position)) {
            return false;
          }

          if (isEnemyPiece(position)) {
            hasSeenEnemyPiece = true;
            return true;
          }

          return !isFriendlyPiece(position);
        },
      );
    };

  return {
    isPiece,
    isEnemyPiece,
    isFriendlyPiece,
    isTargetableByEnemyPiece,
    createPositionsGenerator,
  };
}

function posOnBoard(p: IPosition) {
  return p.r >= 0 && p.r <= 7;
}

function createPotentialMoves(moves: IPosition[]) {
  return moves.filter(posOnBoard);
}

// need to assume that white is always on top, black is always on bottom
// can rotate the view if needed but this simplifies the move logic significantly

function Pawn(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "PAWN",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);
      const generatePositions = helpers.createPositionsGenerator(position, 2);

      const pawnDirection = base.getPlayer() === "w" ? 1 : -1;
      const pawnStartingRow =
        base.getPlayer() === "w" ? 1 : gameState.board.length - 2;

      const forward = createPotentialMoves(
        // pawn-specific behavior:
        // locked move direction according to color
        generatePositions(pawnDirection, 0),
      ).filter((p, i) => {
        if (helpers.isPiece(p)) return false;

        // pawn-specific behavior:
        // can't move 2 squares unless pawn is on starting row
        if (i === 1 && position.r !== pawnStartingRow) {
          return false;
        }

        return true;
      });

      const diagonal = createPotentialMoves([
        { r: position.r + pawnDirection, c: position.c + 1 },
        { r: position.r + pawnDirection, c: position.c - 1 },
      ]).filter((p) => {
        const pieceOnSquare = gameState.board[p.r][p.c];

        // can only move diagonal if there's an enemy piece in the diagonal square
        return pieceOnSquare && pieceOnSquare.getPlayer() !== base.getPlayer();
      });

      return new Set([...forward, ...diagonal].map(posToKey));
    },
    Component: (props) => (
      <PieceComponent {...props} color={base.getPlayer()} name="pawn" />
    ),
  };
}

function Knight(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "KNIGHT",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);
      const possibleMoves = createPotentialMoves([
        { r: position.r - 2, c: position.c + 1 },
        { r: position.r - 1, c: position.c + 2 },
        { r: position.r + 1, c: position.c + 2 },
        { r: position.r + 2, c: position.c + 1 },
        { r: position.r + 2, c: position.c - 1 },
        { r: position.r + 1, c: position.c - 2 },
        { r: position.r - 1, c: position.c - 2 },
        { r: position.r - 2, c: position.c - 1 },
      ]).filter((p) => !helpers.isFriendlyPiece(p));
      return new Set(possibleMoves.map(posToKey));
    },
    Component: (props) => (
      <PieceComponent {...props} color={base.getPlayer()} name="knight" />
    ),
  };
}

function Bishop(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "BISHOP",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);

      const generatePositions = helpers.createPositionsGenerator(position, 8);
      const possibleMoves = createPotentialMoves([
        ...generatePositions(-1, 1),
        ...generatePositions(1, 1),
        ...generatePositions(1, -1),
        ...generatePositions(-1, -1),
      ]);

      return new Set(possibleMoves.map(posToKey));
    },
    Component: (props) => (
      <PieceComponent {...props} color={base.getPlayer()} name="bishop" />
    ),
  };
}

function Rook(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "ROOK",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);

      const generatePositions = helpers.createPositionsGenerator(position, 8);

      const possibleMoves = createPotentialMoves([
        ...generatePositions(-1, 0),
        ...generatePositions(0, 1),
        ...generatePositions(1, 0),
        ...generatePositions(0, -1),
      ]);

      return new Set(possibleMoves.map(posToKey));
    },
    Component: (props) => (
      <PieceComponent {...props} color={base.getPlayer()} name="rook" />
    ),
  };
}

function Queen(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "ROOK",
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
    Component: (props) => (
      <PieceComponent {...props} color={base.getPlayer()} name="queen" />
    ),
  };
}

function King(r: number, c: number, player: "b" | "w"): IPiece {
  const base = usePieceBaseProperties({ r, c }, player);

  return {
    ...base,
    name: "KING",
    getValidMovePositions(gameState) {
      const position = base.getPosition();
      const helpers = createPieceHelpers(gameState, player);
      // TODO: disallow the king from moving into check, will require changing valid move
      // computation to always do both sides at once
      const possibleMoves = createPotentialMoves([
        { r: position.r - 1, c: position.c },
        { r: position.r - 1, c: position.c + 1 },
        { r: position.r, c: position.c + 1 },
        { r: position.r + 1, c: position.c + 1 },
        { r: position.r + 1, c: position.c },
        { r: position.r + 1, c: position.c - 1 },
        { r: position.r, c: position.c - 1 },
        { r: position.r - 1, c: position.c - 1 },
      ]).filter(
        (p) =>
          !(helpers.isFriendlyPiece(p) || helpers.isTargetableByEnemyPiece(p)),
      );

      return new Set(possibleMoves.map(posToKey));
    },
    Component: (props) => (
      <PieceComponent {...props} color={base.getPlayer()} name="king" />
    ),
  };
}

function stepPositions(
  p: IPosition,
  rDir: number,
  cDir: number,
  steps: number,
  isValid: (p: IPosition) => boolean,
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

const SYMBOL_TO_PIECE = {
  " ": null,
  P: [Pawn, "w"],
  p: [Pawn, "b"],
  N: [Knight, "w"],
  n: [Knight, "b"],
  B: [Bishop, "w"],
  b: [Bishop, "b"],
  R: [Rook, "w"],
  r: [Rook, "b"],
  K: [King, "w"],
  k: [King, "b"],
  Q: [Queen, "w"],
  q: [Queen, "b"],
} as const;

function isValidSymbol(symbol: string): symbol is keyof typeof SYMBOL_TO_PIECE {
  return symbol in SYMBOL_TO_PIECE;
}

const DEFAULT_BOARD: (keyof typeof SYMBOL_TO_PIECE)[][] = [
  ["R", "N", "B", " ", "Q", "B", "N", "R"],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", "K", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["r", "n", "b", "k", "q", "b", "n", "r"],
];

function initializeBoard(boardSymbols: string[][]) {
  const board: IGameState["board"] = [];
  for (let r = 0; r < 8; r++) {
    const row: IGameState["board"][number] = [];
    for (let c = 0; c < 8; c++) {
      const symbol = boardSymbols[r][c];
      if (!isValidSymbol(symbol)) {
        row.push(null);
        continue;
      }

      const pieceData = SYMBOL_TO_PIECE[symbol];
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

function getInitialGameState() {
  let gameState: IGameState = {
    player: "w",
    selectedSquare: null,
    validMovesFromPosition: new Map(),
    board: initializeBoard(DEFAULT_BOARD),
    capturedPieces: { w: [], b: [] },
  };

  gameState = applyMoveTurnToGameState(gameState, null);

  return gameState;
}

function App() {
  const [gameState, setGameState] = useState(getInitialGameState());

  const selectedPieceKey = useMemo(
    () =>
      gameState.selectedSquare !== null
        ? posToKey(gameState.selectedSquare)
        : null,
    [gameState.selectedSquare],
  );

  const validMovePositions = useMemo(() => {
    if (!selectedPieceKey) return new Set<string>();

    return (
      gameState.validMovesFromPosition.get(selectedPieceKey) ||
      new Set<string>()
    );
  }, [gameState.validMovesFromPosition, selectedPieceKey]);

  const turnText = gameState.player === "w" ? "White to move" : "Black to move";

  const onClickSquare = (
    squarePosition: IPosition,
    squarePiece: IPieceOnBoard,
  ) => {
    const isSelectingOwnPiece =
      squarePiece && squarePiece.getPlayer() === gameState.player;

    if (isSelectingOwnPiece) {
      setGameState((s) => ({
        ...s,
        selectedSquare: squarePiece.getPosition(),
      }));
      return;
    }

    const isValidMove = validMovePositions.has(posToKey(squarePosition));
    if (!isValidMove) {
      return;
    }

    const newGameState = applyMoveTurnToGameState(gameState, squarePosition);
    setGameState(newGameState);
  };

  return (
    <div>
      {turnText}
      <CapturedPieces gameState={gameState} player="b" />
      {gameState.board.map((row, r) => {
        const rowData = row.map((Piece, c) => {
          const squareClassName = (r + c) % 2 === 0 ? "light" : "dark";
          const key = posToKey({ r, c });

          const isSelected = key === selectedPieceKey;
          const isMoveTarget = validMovePositions.has(key);

          return (
            <Square
              key={key}
              onClick={() => onClickSquare({ r, c }, Piece)}
              className={classNames(squareClassName, {
                withPiece: !!Piece,
                selected: isSelected,
              })}
            >
              {isMoveTarget && <MoveTargetIndicator />}
              {Piece && <Piece.Component isSelected={isSelected} />}
            </Square>
          );
        });

        return <Row key={`r${r}`}>{rowData}</Row>;
      })}
      <CapturedPieces gameState={gameState} player="w" />
    </div>
  );
}

function applyMoveTurnToGameState(
  gameState: IGameState,
  moveTo: IPosition | null, // passed as null when computing initial gameState
): IGameState {
  const newBoard: Board = [...gameState.board];
  const newPlayer = moveTo ? (gameState.player === "w" ? "b" : "w") : "w";
  const newCapturedPieces = { ...gameState.capturedPieces };

  const { selectedSquare } = gameState;

  if (moveTo && !selectedSquare) {
    throw new Error("Cannot move while applying turn without a selected piece");
  }

  if (moveTo && selectedSquare) {
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

      if (piece.name === "KING" && piece.getPlayer() === newPlayer) {
        newPlayerKing = piece;
        continue;
      }

      newGameState.validMovesFromPosition.set(
        posToKey(piece.getPosition()),
        piece.getValidMovePositions(newGameState),
      );
    }
  }

  if (!newPlayerKing) {
    throw new Error(
      "Processed new game board state without detecting a friendly king",
    );
  }

  newGameState.validMovesFromPosition.set(
    posToKey(newPlayerKing.getPosition()),
    newPlayerKing.getValidMovePositions(newGameState),
  );

  return newGameState;
}

interface ISquareProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

function Square(props: ISquareProps) {
  return (
    <div {...props} className={classNames("Square", props.className)}>
      {props.children}
    </div>
  );
}

function Row(props: { children?: React.ReactNode }) {
  return <div className="Row">{props.children}</div>;
}

export default App;

type Board = IPieceOnBoard[][];

interface IGameState {
  player: Color;
  board: Board;
  selectedSquare: IPosition | null;
  validMovesFromPosition: Map<string, Set<string>>;
  capturedPieces: {
    w: IPiece[];
    b: IPiece[];
  };
}

interface IPosition {
  r: number;
  c: number;
}

interface IPieceBase {
  readonly name: string;
}

interface IPieceMethods {
  getValidMovePositions(gameState: IGameState): Set<string>;
  getPlayer: () => Color;
  setPlayer: (player: Color) => void;
  getPosition: () => IPosition;
  setPosition: (pos: IPosition) => void;
  Component: (props: { isSelected: boolean }) => React.ReactNode;
}

type IPiece = IPieceBase & IPieceMethods;

type IPieceOnBoard = IPiece | null;

interface IPieceComponentProps {
  color: Color;
  name: Piece;
  className?: string;
  isSelected: boolean;
}

function PieceComponent(props: IPieceComponentProps) {
  const src = useMemo(
    () => defaultPieceImageMap[props.color][props.name],
    [props.name, props.color],
  );

  return (
    <div className={classNames("PieceContainer", props.className)}>
      <img src={src} />
    </div>
  );
}

function MoveTargetIndicator() {
  return (
    <div className="MoveTarget">
      <div />
    </div>
  );
}

function CapturedPieces(props: { gameState: IGameState; player: Color }) {
  return (
    <div className="CapturedPiecesContainer">
      {props.gameState.capturedPieces[props.player].map((piece, i) => (
        <CapturedPiece key={i} component={piece.Component} />
      ))}
    </div>
  );
}

function CapturedPiece(props: { component: IPieceMethods["Component"] }) {
  return (
    <div className="CapturedPiece">
      <props.component isSelected={false} />
    </div>
  );
}

/*
Game loop:
1. Calculate all valid moves for current player
  - check and store if player is in check
  - for each piece
    - call getValidMovePositions()
    - store valid moves in a dictionary
    - if no _valid moves_:
      - if player is in check, then it's a checkmate
      - if player is not in check, then it's a stalemate
    - if has valid moves, then wait for the player to make a move

What is a valid move for a given piece?
- it targets a position which the piece is able to move to given its move set
- it results in a game state where the current player is not in check
*/
