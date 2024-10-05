import imgBlackPawn from "./assets/chess/PNGs/No shadow/1x/b_pawn_1x_ns.png";
import imgBlackRook from "./assets/chess/PNGs/No shadow/1x/b_rook_1x_ns.png";
import imgBlackKnight from "./assets/chess/PNGs/No shadow/1x/b_knight_1x_ns.png";
import imgBlackBishop from "./assets/chess/PNGs/No shadow/1x/b_bishop_1x_ns.png";
import imgBlackQueen from "./assets/chess/PNGs/No shadow/1x/b_queen_1x_ns.png";
import imgBlackKing from "./assets/chess/PNGs/No shadow/1x/b_king_1x_ns.png";
import imgWhitePawn from "./assets/chess/PNGs/No shadow/1x/w_pawn_1x_ns.png";
import imgWhiteRook from "./assets/chess/PNGs/No shadow/1x/w_rook_1x_ns.png";
import imgWhiteKnight from "./assets/chess/PNGs/No shadow/1x/w_knight_1x_ns.png";
import imgWhiteBishop from "./assets/chess/PNGs/No shadow/1x/w_bishop_1x_ns.png";
import imgWhiteQueen from "./assets/chess/PNGs/No shadow/1x/w_queen_1x_ns.png";
import imgWhiteKing from "./assets/chess/PNGs/No shadow/1x/w_king_1x_ns.png";

export type Color = "w" | "b";

export type Piece = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

type PieceImageMap = { [key in Color]: { [key in Piece]: string } };

export const defaultPieceImageMap: PieceImageMap = {
  w: {
    pawn: imgWhitePawn,
    rook: imgWhiteRook,
    knight: imgWhiteKnight,
    bishop: imgWhiteBishop,
    queen: imgWhiteQueen,
    king: imgWhiteKing,
  },
  b: {
    pawn: imgBlackPawn,
    rook: imgBlackRook,
    knight: imgBlackKnight,
    bishop: imgBlackBishop,
    queen: imgBlackQueen,
    king: imgBlackKing,
  },
};
