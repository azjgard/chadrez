import * as Pieces from "./pieces";

export type Color = "w" | "b";

export type Piece = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export function posToKey(pos: IPosition | number, c?: number) {
  if (typeof pos === "number" && typeof c === "number") {
    return +pos + "__" + c;
  }

  if (typeof pos === "object") {
    return +pos.r + "__" + pos.c;
  }

  throw new Error("Invalid posToKey");
}

export function keyToPos(pos: string) {
  const [rStr, cStr] = pos.split("__");

  const r = parseInt(rStr);
  if (isNaN(r)) throw new Error("Invalid pos key parsing r: " + pos);

  const c = parseInt(cStr);
  if (isNaN(c)) throw new Error("Invalid pos key parsing c: " + pos);

  return { r, c };
}

export function posOnBoard(p: IPosition, boardSize: number) {
  return p.r >= 0 && p.r <= boardSize - 1;
}

export interface IGameState {
  player: Color;
  board: Board;
  selectedSquare: IPosition | null;
  validMovesFromPosition: Map<string, Set<string>>;
  capturedPieces: {
    w: Pieces.PieceSymbol[];
    b: Pieces.PieceSymbol[];
  };
}

export type Board = Pieces.PieceSymbol[][];

export interface IPosition {
  r: number;
  c: number;
}

export interface IPieceBase {
  readonly name: Piece;
}

export interface IPieceMethods {
  getValidMovePositions(gameState: IGameState): Set<string>;
  getPlayer: () => Color;
  setPlayer: (player: Color) => void;
  getPosition: () => IPosition;
  setPosition: (pos: IPosition) => void;
}

export type IPiece = IPieceBase & IPieceMethods;

export type IPieceOnBoard = IPiece | null;
