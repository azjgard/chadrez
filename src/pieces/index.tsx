import { Bishop } from "./Bishop";
import { King } from "./King";
import { Knight } from "./Knight";
import { Pawn } from "./Pawn";
import { Queen } from "./Queen";
import { Rook } from "./Rook";

export { Bishop, King, Knight, Pawn, Queen, Rook };

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

export type Symbol = keyof typeof SYMBOL_TO_PIECE;

export function isValidSymbol(symbol: string): symbol is Symbol {
  return symbol in SYMBOL_TO_PIECE;
}

export function getSymbol<T extends Symbol>(
  key: T,
): (typeof SYMBOL_TO_PIECE)[T] {
  return SYMBOL_TO_PIECE[key];
}

export function createBoard(board: Symbol[][]) {
  return board;
}
