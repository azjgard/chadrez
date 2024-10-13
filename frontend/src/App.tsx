import { useState, useMemo } from "react";
import classNames from "classnames";
import * as Pieces from "./pieces";
import { Color, IGameState, IPosition, posToKey } from "./lib";
import { applyMoveTurnToGameState, getInitialGameState } from "./gameState";

import "./App.css";
import { defaultPieceImageMap } from "./assets/pieceImages";

const initialState = getInitialGameState();

function App() {
  const [gameState, setGameState] = useState(initialState);
  const [copyText, setCopyText] = useState("Copy board to clipboard");

  const selectedPieceKey = useMemo(
    () =>
      gameState.selectedSquare !== null
        ? posToKey(gameState.selectedSquare)
        : null,
    [gameState.selectedSquare]
  );

  const validMovePositions = useMemo(() => {
    if (!selectedPieceKey) return new Set<string>();

    return (
      gameState.validMovesFromPosition.get(selectedPieceKey) ||
      new Set<string>()
    );
  }, [gameState.validMovesFromPosition, selectedPieceKey]);

  const onClickSquare = (pos: IPosition) => {
    const maybePiece = Pieces.maybeGetPiece(gameState.board[pos.r][pos.c]);

    const isSelectingOwnPiece =
      maybePiece && maybePiece.player === gameState.player;

    if (isSelectingOwnPiece) {
      setGameState((s) => ({
        ...s,
        selectedSquare: pos,
      }));
      return;
    }

    const isValidMove = validMovePositions.has(posToKey(pos));
    if (!isValidMove) {
      return;
    }

    const newGameState = applyMoveTurnToGameState(gameState, pos);
    setGameState(newGameState);
  };

  const text = getText(gameState);

  return (
    <div>
      {text}
      <CapturedPieces gameState={gameState} player="b" />
      {gameState.board.map((row, r) => {
        const rowData = row.map((pieceSymbol, c) => {
          const squareClassName = (r + c) % 2 === 0 ? "light" : "dark";
          const key = posToKey({ r, c });

          const isSelected = key === selectedPieceKey;
          const isMoveTarget = validMovePositions.has(key);

          return (
            <Square
              key={key}
              onClick={() => onClickSquare({ r, c })}
              className={classNames(squareClassName, {
                withPiece: !!pieceSymbol,
                selected: isSelected,
              })}
            >
              {isMoveTarget && <MoveTargetIndicator />}
              {Pieces.isNonEmptySymbol(pieceSymbol) && (
                <PieceComponent symbol={pieceSymbol} isSelected={isSelected} />
              )}
            </Square>
          );
        });

        return <Row key={`r${r}`}>{rowData}</Row>;
      })}
      <CapturedPieces gameState={gameState} player="w" />

      <button
        onClick={async () => {
          await navigator.clipboard.writeText(JSON.stringify(gameState.board));
          setCopyText("Copied!");
          setTimeout(() => setCopyText("Copy board to clipboard"), 1000);
        }}
      >
        {copyText}
      </button>
    </div>
  );
}

function getText(gameState: IGameState) {
  if (gameState.condition === "stalemate") {
    return "Stalemate!";
  }

  if (gameState.condition === "checkmate") {
    const winner = gameState.player === "w" ? "Black" : "White";
    return `${winner} wins!`;
  }

  const player = gameState.player === "w" ? "White" : "Black";
  if (gameState.condition === "check") {
    return `${player} is in check!`;
  }

  return `${player} to move`;
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
      {props.gameState.capturedPieces[props.player].map((symbol, i) => (
        <CapturedPiece key={i} symbol={symbol} />
      ))}
    </div>
  );
}

function CapturedPiece(props: { symbol: Pieces.PieceSymbol }) {
  return (
    <div className="CapturedPiece">
      <PieceComponent {...props} isSelected={false} />
    </div>
  );
}

interface IPieceComponentProps {
  symbol: Pieces.PieceSymbol;
  className?: string;
  isSelected: boolean;
}

export function PieceComponent(props: IPieceComponentProps) {
  const src = useMemo(() => {
    const piece = Pieces.getPiece(props.symbol);
    return defaultPieceImageMap[piece.player][piece.name];
  }, [props.symbol]);

  return (
    <div className={classNames("PieceContainer", props.className)}>
      <img src={src} />
    </div>
  );
}

export default App;
