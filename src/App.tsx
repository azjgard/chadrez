import { useState, useMemo } from "react";
import classNames from "classnames";
import "./App.css";

import { Color, Piece, defaultPieceImageMap } from "./lib";

function posToKey(pos: IPosition | number, c?: number) {
  if (typeof pos === "number" && typeof c === "number") {
    return "__" + pos + "__" + c + "__";
  }

  if (typeof pos === "object") {
    return "__" + pos.r + "__" + pos.c + "__";
  }

  throw new Error("Invalid posToKey");
}

// need to assume that white is always on top, black is always on bottom
// can rotate the view if needed but this simplifies the move logic significantly

function Pawn(r: number, c: number, player: "b" | "w"): IPiece {
  let _position = { r: r, c: c };
  let _player = player;

  function getPlayer(): ReturnType<IPiece["getPlayer"]> {
    return _player;
  }

  function setPlayer(p: Color): ReturnType<IPiece["setPlayer"]> {
    _player = p;
  }

  function getPosition(): ReturnType<IPiece["getPosition"]> {
    return _position;
  }

  function setPosition(p: IPosition): ReturnType<IPiece["setPosition"]> {
    _position = p;
  }

  return {
    name: "PAWN",
    player: player,
    getPlayer,
    setPlayer,
    getPosition,
    setPosition,
    getValidMovePositions(gameState) {
      const dir = _player === "w" ? 1 : -1;
      const startingRow = _player === "w" ? 1 : gameState.board.length - 2;

      const position = getPosition();

      const possibleForwardMoves = [
        { r: position.r + dir, c: position.c },
        { r: position.r + dir * 2, c: position.c },
      ].filter((possibleMovePosition, i) => {
        // can't move off the board
        if (
          possibleMovePosition.r < 0 ||
          possibleMovePosition.r > gameState.board.length - 1
        ) {
          return false;
        }

        // cant move into a square where there is already a piece
        const pieceAlreadyOnSquare =
          gameState.board[possibleMovePosition.r][possibleMovePosition.c];
        if (pieceAlreadyOnSquare) {
          return false;
        }

        // can't move 2 squares unless pawn is on starting row
        if (i === 1 && position.r !== startingRow) {
          return false;
        }

        return true;
      });

      const possibleDiagonalMoves = [
        { r: position.r + dir, c: position.c + 1 },
        { r: position.r + dir, c: position.c - 1 },
      ].filter((possibleMovePosition) => {
        // can't move off the board
        if (
          possibleMovePosition.r < 0 ||
          possibleMovePosition.r > gameState.board.length - 1
        ) {
          return false;
        }

        const pieceOnSquare =
          gameState.board[possibleMovePosition.r][possibleMovePosition.c];

        // can only move diagonal if there's an enemy piece in the diagonal square
        return pieceOnSquare && pieceOnSquare.player !== _player;
      });

      return new Set(
        [...possibleForwardMoves, ...possibleDiagonalMoves].map(posToKey),
      );
    },
    Component: (props) => (
      <PieceComponent {...props} color={_player} name="pawn" />
    ),
  };
}
const P = Pawn;

const defaultBoard: IGameState["board"] =
  // prettier-ignore
  [
    [P(0, 0, "w"), P(0, 1, "w"), P(0, 2, "w"), P(0, 3, "w"), P(0, 4, "w"), P(0, 5, "w"), P(0, 6, "w"), P(0, 7, "w")],
    [P(1, 0, "w"), P(1, 1, "w"), P(1, 2, "w"), P(1, 3, "w"), P(1, 4, "w"), P(1, 5, "w"), P(1, 6, "w"), P(1, 7, "w")],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [P(6, 0, "b"), P(6, 1, "b"), P(6, 2, "b"), P(6, 3, "b"), P(6, 4, "b"), P(6, 5, "b"), P(6, 6, "b"), P(6, 7, "b")],
    [P(7, 0, "b"), P(7, 1, "b"), P(7, 2, "b"), P(7, 3, "b"), P(7, 4, "b"), P(7, 5, "b"), P(7, 6, "b"), P(7, 7, "b")],
  ];

function getInitialGameState() {
  let gameState: IGameState = {
    player: "w",
    selectedSquare: null,
    validMovesFromPosition: new Map(),
    board: defaultBoard,
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
      squarePiece && squarePiece.player === gameState.player;

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
    console.log(newGameState.board[3]);
    setGameState(newGameState);
  };

  return (
    <div>
      {turnText}
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
  }

  const newGameState: IGameState = {
    board: newBoard,
    validMovesFromPosition: new Map(),
    selectedSquare: null,
    player: newPlayer,
    capturedPieces: newCapturedPieces,
  };

  newGameState.board.forEach((row) => {
    row.forEach((piece) => {
      // check valid moves for only squares occupied by the new player's pieces
      if (!(piece && piece.player === newPlayer)) return;

      newGameState.validMovesFromPosition.set(
        posToKey(piece.getPosition()),
        piece.getValidMovePositions(newGameState),
      );
    });
  });

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
  readonly player: Color;
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
