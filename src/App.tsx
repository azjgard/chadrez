import { useState, Fragment, useMemo } from "react";
import classNames from "classnames";
import "./App.css";

import imgBlackPawn from "./assets/chess/PNGs/No shadow/1x/b_pawn_1x_ns.png";
import imgWhitePawn from "./assets/chess/PNGs/No shadow/1x/w_pawn_1x_ns.png";

function positionsEq(pos1: IPosition, pos2: IPosition) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function Pawn(x: number, y: number, player: "b" | "w"): IPiece {
  return {
    player,
    position: { x, y },
    getValidMovePositions(gameState: IGameState) {
      return new Map();
    },
    Component: () => <PawnComponent player={player} />,
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

function App() {
  const [gameState, setGameState] = useState<IGameState>({
    turn: "w",
    selectedPiece: null,
    validMovesFromPosition: new Map(),
    board: defaultBoard,
  });

  const selectedPieceKey = useMemo(
    () =>
      gameState.selectedPiece !== null
        ? `r${gameState.selectedPiece.x}c${gameState.selectedPiece.y}`
        : null,
    [gameState.selectedPiece]
  );

  const nextTurn = () => {
    setGameState((gameState) => applyNewTurnToGameState(gameState));
  };

  const onCapturePiece = (
    gameState: IGameState,
    capturedPiecePosition: IPosition
  ) => {
    const piece =
      gameState.board[capturedPiecePosition.x][capturedPiecePosition.y];
    if (!piece) {
      throw new Error(
        `No piece to capture at (${capturedPiecePosition.y}, ${capturedPiecePosition.y})`
      );
    }

    console.log("Should capture piece ", piece);
  };

  const onMovePiece = (currentPosition: IPosition, newPosition: IPosition) => {
    setGameState((gameState) => {
      const piece = gameState.board[currentPosition.x][currentPosition.y];
      if (!piece) {
        throw new Error(
          `There is not currently a piece at (${currentPosition.y}, ${currentPosition.y})`
        );
      }

      const pieceToCapture = gameState.board[newPosition.x][newPosition.y];
      if (pieceToCapture) {
        if (pieceToCapture.player === gameState.turn) {
          throw new Error(`Player cannot capture their own piece`);
        }
        onCapturePiece(gameState, pieceToCapture.position);
      }

      gameState.board[currentPosition.x][currentPosition.y] = null;
      gameState.board[newPosition.x][newPosition.y] = {
        ...piece,
        position: newPosition,
      };

      return {
        ...gameState,
        turn: gameState.turn === "w" ? "b" : "w",
        board: [...gameState.board] as unknown as IGameState["board"],
      };
    });
    nextTurn();
  };

  const turnText = gameState.turn === "w" ? "White to move" : "Black to move";

  return (
    <div>
      {turnText}
      {gameState.board.map((row, r) => {
        const rowData = row.map((Piece, c) => {
          const squareClassName = (r + c) % 2 === 0 ? "light" : "dark";
          const key = `r${r}c${c}`;

          const isSelected = key === selectedPieceKey;

          if (!Piece) {
            return (
              <Square className={squareClassName} key={key}>
                <Fragment />
              </Square>
            );
          }

          return (
            <Square className={squareClassName} key={key}>
              <Piece.Component isSelected={isSelected} />
            </Square>
          );
        });

        return <Row key={`r${r}`}>{rowData}</Row>;
      })}
    </div>
  );
}

function applyNewTurnToGameState(gameState: IGameState): IGameState {
  const newPlayerTurn = gameState.turn === "w" ? "b" : "w";

  const validMovesFromPosition: Map<IPosition, Set<IPosition>> = new Map();

  gameState.board.forEach((row) => {
    row.forEach((piece) => {
      if (!piece) return;
      if (piece.player !== newPlayerTurn) return;

      // TODO: compute whether or not king is in check for new player

      const validMovePositions = piece.getValidMovePositions(gameState);
      if (!validMovePositions.size) return;

      validMovesFromPosition.set(piece.position, validMovePositions);
    });
  });

  return {
    board: gameState.board,
    validMovesFromPosition,
    selectedPiece: null,
    turn: newPlayerTurn,
  };
}

function Square(props: { children?: React.ReactNode; className: string }) {
  return (
    <div className={classNames("Square", props.className)}>
      {props.children}
    </div>
  );
}

function Row(props: { children?: React.ReactNode }) {
  return <div className="Row">{props.children}</div>;
}

export default App;

interface IGameState {
  turn: "b" | "w";
  board: FixedLengthArray<FixedLengthArray<IPieceOnBoard, 8>, 8>;
  selectedPiece: IPosition | null;
  validMovesFromPosition: Map<IPosition, Set<IPosition>>;
}

interface IPosition {
  x: number;
  y: number;
}

interface IPiece {
  player: "b" | "w";
  position: IPosition;
  getValidMovePositions(gameState: IGameState): Set<IPosition>;
  Component: (props: { isSelected: boolean }) => React.ReactNode;
}

interface IPieceConstructor {
  p: IPosition;
}

type IPieceOnBoard = IPiece | null;

function PieceContainer(props: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={classNames("PieceContainer", props.className)}>
      {props.children}
    </div>
  );
}

function PawnComponent(props: { className?: string; player: "b" | "w" }) {
  const src = useMemo(
    () => (props.player === "b" ? imgBlackPawn : imgWhitePawn),
    [props.player]
  );

  return (
    <PieceContainer className={props.className}>
      <img src={src} />
    </PieceContainer>
  );
}

// Helpers
type ArrayLengthMutationKeys = "splice" | "push" | "pop" | "shift" | "unshift";
type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> = Pick<
  TObj,
  Exclude<keyof TObj, ArrayLengthMutationKeys>
> & {
  readonly length: L;
  [I: number]: T;
  [Symbol.iterator]: () => IterableIterator<T>;
};

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
