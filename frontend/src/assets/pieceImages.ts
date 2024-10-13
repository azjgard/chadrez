import imgBlackPawn from "./chess/PNGs/No shadow/1x/b_pawn_1x_ns.png";
import imgBlackRook from "./chess/PNGs/No shadow/1x/b_rook_1x_ns.png";
import imgBlackKnight from "./chess/PNGs/No shadow/1x/b_knight_1x_ns.png";
import imgBlackBishop from "./chess/PNGs/No shadow/1x/b_bishop_1x_ns.png";
import imgBlackQueen from "./chess/PNGs/No shadow/1x/b_queen_1x_ns.png";
import imgBlackKing from "./chess/PNGs/No shadow/1x/b_king_1x_ns.png";
import imgWhitePawn from "./chess/PNGs/No shadow/1x/w_pawn_1x_ns.png";
import imgWhiteRook from "./chess/PNGs/No shadow/1x/w_rook_1x_ns.png";
import imgWhiteKnight from "./chess/PNGs/No shadow/1x/w_knight_1x_ns.png";
import imgWhiteBishop from "./chess/PNGs/No shadow/1x/w_bishop_1x_ns.png";
import imgWhiteQueen from "./chess/PNGs/No shadow/1x/w_queen_1x_ns.png";
import imgWhiteKing from "./chess/PNGs/No shadow/1x/w_king_1x_ns.png";

import { Color, Piece } from "../lib";

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
