import { useState, Fragment, useMemo } from "react";
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

function keyToPos(posKey: string) {
  const [r, c] = posKey.split("__");
  return { r, c };
}

// need to assume that white is always on top, black is always on bottom
// can rotate the view if needed but this simplifies the move logic significantly

function Pawn(r: number, c: number, _player: "b" | "w"): IPiece {
  let position = { r: r, c: c };
  let player = _player;

  return {
    name: "PAWN",
    player,
    position,
    getValidMovePositions(gameState: IGameState) {
      const dir = player === "w" ? 1 : -1;
      const startingRow = player === "w" ? 1 : gameState.board.length - 2;

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
        return pieceOnSquare && pieceOnSquare.player !== player;
      });

      return new Set(
        [...possibleForwardMoves, ...possibleDiagonalMoves].map(posToKey),
      );
    },
    Component: (props) => (
      <PieceComponent {...props} color={player} name="pawn" />
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
    selectedPiece: null,
    validMovesFromPosition: new Map(),
    board: defaultBoard,
  };

  gameState = applyNewTurnToGameState(gameState, "w");

  return gameState;
}

function App() {
  const [gameState, setGameState] = useState(getInitialGameState());

  const selectedPieceKey = useMemo(
    () =>
      gameState.selectedPiece !== null
        ? posToKey(gameState.selectedPiece)
        : null,
    [gameState.selectedPiece],
  );

  const validMovePositions = useMemo(() => {
    if (!selectedPieceKey) return new Set<string>();

    return (
      gameState.validMovesFromPosition.get(selectedPieceKey) ||
      new Set<string>()
    );
  }, [gameState.validMovesFromPosition, selectedPieceKey]);

  const nextTurn = () => {
    setGameState((gameState) =>
      applyNewTurnToGameState(gameState, gameState.player === "w" ? "b" : "w"),
    );
  };

  const onCapturePiece = (
    gameState: IGameState,
    capturedPiecePosition: IPosition,
  ) => {
    const piece =
      gameState.board[capturedPiecePosition.r][capturedPiecePosition.c];
    if (!piece) {
      throw new Error(
        `No piece to capture at (${capturedPiecePosition.c}, ${capturedPiecePosition.c})`,
      );
    }
  };

  const onMovePiece = (currentPosition: IPosition, newPosition: IPosition) => {
    setGameState((gameState) => {
      const piece = gameState.board[currentPosition.r][currentPosition.c];
      if (!piece) {
        throw new Error(
          `There is not currently a piece at (${currentPosition.c}, ${currentPosition.c})`,
        );
      }

      const pieceToCapture = gameState.board[newPosition.r][newPosition.c];
      if (pieceToCapture) {
        if (pieceToCapture.player === gameState.player) {
          throw new Error(`Player cannot capture their own piece`);
        }
        onCapturePiece(gameState, pieceToCapture.position);
      }

      gameState.board[currentPosition.r][currentPosition.c] = null;
      gameState.board[newPosition.r][newPosition.c] = {
        ...piece,
        position: newPosition,
      };

      return {
        ...gameState,
        player: gameState.player === "w" ? "b" : "w",
        board: [...gameState.board] as unknown as IGameState["board"],
      };
    });
    nextTurn();
  };

  const turnText = gameState.player === "w" ? "White to move" : "Black to move";

  const onClickSquare = (
    squarePosition: IPosition,
    squarePiece: IPieceOnBoard,
  ) => {
    const isSelectingOwnPiece =
      squarePiece && squarePiece.player === gameState.player;

    if (isSelectingOwnPiece) {
      setGameState((s) => ({ ...s, selectedPiece: squarePiece.position }));
      return;
    }

    // if not selecting own piece and doesn't have a piece currently selected,
    // selecting a square doesn't do anything
    if (!gameState.selectedPiece) {
      return;
    }

    // TODO: compute this?
    const isInRangeOfSelectedPiece = false;
    if (!isInRangeOfSelectedPiece) {
      return;
    }

    if (squarePiece) {
      // TODO: compute this?
      const isEnemyPiece =
        squarePiece && squarePiece.player !== gameState.player;
    } else {
      if (isInRangeOfSelectedPiece) {
        // move there
      } else {
        // noop, not in range
      }
    }

    // if selected piece:
    // - if square is empty & in range, move there
    // - if square is empty & not in range, noop
    // - if square has own piece, select it
    // - if square has enemy piece & in range, move there & take it
    //
    // if no selected piece:
    // - if square is empty, noop
    // - if is enemy piece, noop
    // - if is own piece, select it
    const isValidMovePosition = false;
    if (!squarePiece) {
      setGameState((s) => ({ ...s, selectedPiece: null }));
      return;
    }

    if (squarePiece.player !== gameState.player) return;
    setGameState((s) => ({ ...s, selectedPiece: squarePiece.position }));
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

          if (!Piece) {
            return (
              <Square className={squareClassName} key={key}>
                {isMoveTarget && <MoveTargetIndicator />}
                <Fragment />
              </Square>
            );
          }

          return (
            <Square
              key={key}
              onClick={() => onClickSquare({ r: r, c: c }, Piece)}
              className={classNames(squareClassName, "withPiece", {
                selected: isSelected,
              })}
            >
              {isMoveTarget && <MoveTargetIndicator />}
              <Piece.Component isSelected={isSelected} />
            </Square>
          );
        });

        return <Row key={`r${r}`}>{rowData}</Row>;
      })}
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

function applyNewTurnToGameState(
  gameState: IGameState,
  newPlayerTurn: "w" | "b",
): IGameState {
  const validMovesFromPosition: Map<string, Set<string>> = new Map();
  gameState.board.forEach((row) => {
    row.forEach((piece) => {
      if (!piece) return;
      if (piece.player !== newPlayerTurn) return;

      // TODO: compute whether or not king is in check for new player

      const validMovePositions = piece.getValidMovePositions(gameState);
      if (!validMovePositions.size) return;

      validMovesFromPosition.set(posToKey(piece.position), validMovePositions);
    });
  });

  return {
    board: gameState.board,
    validMovesFromPosition,
    selectedPiece: null,
    player: newPlayerTurn,
  };
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

interface IGameState {
  player: Color;
  board: FixedLengthArray<FixedLengthArray<IPieceOnBoard, 8>, 8>;
  selectedPiece: IPosition | null;
  validMovesFromPosition: Map<string, Set<string>>;
}

interface IPosition {
  r: number;
  c: number;
}

interface IPiece {
  name: string;
  player: Color;
  position: IPosition;
  getValidMovePositions(gameState: IGameState): Set<string>;
  Component: (props: { isSelected: boolean }) => React.ReactNode;
}

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
