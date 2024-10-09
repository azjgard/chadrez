import {
  Color,
  IGameState,
  IPosition,
  keyToPos,
  posOnBoard,
  posToKey,
} from "../lib";

export function usePieceBaseProperties(position: IPosition, player: Color) {
  let _position = { ...position };
  let _player = player;

  function getPlayer() {
    return _player;
  }

  function setPlayer(p: Color) {
    _player = p;
  }

  function getPosition() {
    return _position;
  }

  function setPosition(p: IPosition) {
    _position = p;
  }

  return {
    getPlayer,
    setPlayer,
    getPosition,
    setPosition,
  };
}

export function createPieceHelpers(gameState: IGameState, player: Color) {
  const isTargetableByEnemyPiece = (p: IPosition) => {
    // for each set of enemy valid moves in the move state
    // is targetable if set includes position
    for (const [fromPosKey, positionSet] of Array.from(
      gameState.validMovesFromPosition.entries(),
    )) {
      const fromPos = keyToPos(fromPosKey);
      const piece = gameState.board[fromPos.r][fromPos.c];
      // only check enemy players
      if (!(piece && piece.getPlayer() !== player)) continue;
      if (positionSet.has(posToKey(p))) return true;
    }

    return false;
  };

  const isPiece = (p: IPosition) => !!gameState.board[p.r][p.c];

  const isEnemyPiece = (p: IPosition) =>
    gameState.board[p.r][p.c] &&
    gameState.board[p.r][p.c]!.getPlayer() !== player;

  const isFriendlyPiece = (p: IPosition) =>
    gameState.board[p.r][p.c] &&
    gameState.board[p.r][p.c]!.getPlayer() === player;

  const createPositionsGenerator =
    (position: IPosition, steps: number) =>
    (rowDirection: number, columnDirection: number) => {
      let hasSeenEnemyPiece = false;

      return stepPositions(
        position,
        rowDirection,
        columnDirection,
        steps,
        (position) => {
          if (hasSeenEnemyPiece || !posOnBoard(position)) {
            return false;
          }

          if (isEnemyPiece(position)) {
            hasSeenEnemyPiece = true;
            return true;
          }

          return !isFriendlyPiece(position);
        },
      );
    };

  return {
    isPiece,
    isEnemyPiece,
    isFriendlyPiece,
    isTargetableByEnemyPiece,
    createPositionsGenerator,
  };
}

function stepPositions(
  p: IPosition,
  rDir: number,
  cDir: number,
  steps: number,
  isValid: (p: IPosition) => boolean,
) {
  const positions: IPosition[] = [];
  for (let i = 1; i < 1 + steps; i++) {
    const position = { r: p.r + rDir * i, c: p.c + cDir * i };
    if (!isValid(position)) {
      break;
    }
    positions.push(position);
  }
  return positions;
}

export function createPotentialMoves(moves: IPosition[]) {
  return moves.filter((pos) => posOnBoard(pos));
}
