import { useState, useMemo } from "react";
import classNames from "classnames";
import {
  Color,
  IGameState,
  IPiece,
  IPieceOnBoard,
  IPosition,
  Piece,
  posToKey,
} from "./lib";
import { applyMoveTurnToGameState, getInitialGameState } from "./gameState";

import "./App.css";
import { defaultPieceImageMap } from "./assets/pieceImages";

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
              {Piece && (
                <PieceComponent
                  name={Piece.name}
                  player={Piece.getPlayer()}
                  isSelected={isSelected}
                />
              )}
            </Square>
          );
        });

        return <Row key={`r${r}`}>{rowData}</Row>;
      })}
      <CapturedPieces gameState={gameState} player="w" />
    </div>
  );
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
        <CapturedPiece key={i} piece={piece} player={props.player} />
      ))}
    </div>
  );
}

function CapturedPiece(props: { piece: IPiece; player: Color }) {
  return (
    <div className="CapturedPiece">
      <PieceComponent
        {...props.piece}
        player={props.player}
        isSelected={false}
      />
    </div>
  );
}

interface IPieceComponentProps {
  player: Color;
  name: Piece;
  className?: string;
  isSelected: boolean;
}

export function PieceComponent(props: IPieceComponentProps) {
  const src = useMemo(
    () => defaultPieceImageMap[props.player][props.name],
    [props.name, props.player],
  );

  return (
    <div className={classNames("PieceContainer", props.className)}>
      <img src={src} />
    </div>
  );
}

export default App;
