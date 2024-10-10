import { IPiece, Piece } from "../lib";
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

const PIECE_NAME_TO_SYMBOL: {
  [key in Piece]: {
    [player in "b" | "w"]: PieceSymbol;
  };
} = {
  bishop: { w: "B", b: "b" },
  king: { w: "K", b: "k" },
  knight: { w: "N", b: "n" },
  pawn: { w: "P", b: "p" },
  queen: { w: "Q", b: "q" },
  rook: { w: "R", b: "r" },
};

export type PieceSymbol = keyof typeof SYMBOL_TO_PIECE;

export function isValidSymbol(symbol: string): symbol is PieceSymbol {
  return symbol in SYMBOL_TO_PIECE;
}

export function getSymbol<T extends PieceSymbol>(
  key: T
): (typeof SYMBOL_TO_PIECE)[T] {
  return SYMBOL_TO_PIECE[key];
}

export function getPieceSymbol(piece: IPiece, player: "b" | "w") {
  return PIECE_NAME_TO_SYMBOL[piece.name][player];
}

export function createBoard(board: PieceSymbol[][]) {
  return board;
}
