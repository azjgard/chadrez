import { Board, Color, IPosition, Piece } from "../lib";
import { Bishop } from "./Bishop";
import { King } from "./King";
import { Knight } from "./Knight";
import { Pawn } from "./Pawn";
import { Queen } from "./Queen";
import { Rook } from "./Rook";

export { Bishop, King, Knight, Pawn, Queen, Rook };

const SYMBOL_TO_PIECE = {
  " ": null,
  P: { piece: Pawn, player: "w", name: "pawn" },
  p: { piece: Pawn, player: "b", name: "pawn" },
  N: { piece: Knight, player: "w", name: "knight" },
  n: { piece: Knight, player: "b", name: "knight" },
  B: { piece: Bishop, player: "w", name: "bishop" },
  b: { piece: Bishop, player: "b", name: "bishop" },
  R: { piece: Rook, player: "w", name: "rook" },
  r: { piece: Rook, player: "b", name: "rook" },
  K: { piece: King, player: "w", name: "king" },
  k: { piece: King, player: "b", name: "king" },
  Q: { piece: Queen, player: "w", name: "queen" },
  q: { piece: Queen, player: "b", name: "queen" },
} as const;

export type PieceSymbol = keyof typeof SYMBOL_TO_PIECE;
export type PieceFunction = (board: Board, pos: IPosition) => Set<string>;

export function isValidSymbol(symbol: string): symbol is PieceSymbol {
  return symbol in SYMBOL_TO_PIECE;
}

export function isNonEmptySymbol(
  symbol: string
): symbol is Exclude<PieceSymbol, " "> {
  return symbol !== " " && isValidSymbol(symbol);
}

interface IPieceInfo {
  symbol: PieceSymbol;
  name: Piece;
  piece: PieceFunction;
  player: Color;
}

export function maybeGetPiece(key: string): ReturnType<typeof getPiece> | null {
  try {
    return getPiece(key);
  } catch {
    return null;
  }
}

export function getPiece(symbol: string): IPieceInfo {
  if (!isNonEmptySymbol(symbol))
    throw new Error(`Invalid piece symbol: '${symbol}'`);

  return { ...SYMBOL_TO_PIECE[symbol], symbol };
}
