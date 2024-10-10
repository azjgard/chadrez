import {
  applyMoveTurnToGameState,
  getInitialGameState,
  serializeBoard,
} from "../gameState";

test("Pawns can move", () => {
  let state = getInitialGameState([
    [" ", "P", "K"],
    [" ", " ", " "],
    [" ", "k", " "],
  ]);

  state.selectedSquare = { r: 0, c: 1 };

  state = applyMoveTurnToGameState(state, { r: 1, c: 1 });

  expect(serializeBoard(state.board)).toEqual([
    [" ", " ", "K"],
    [" ", "P", " "],
    [" ", "k", " "],
  ]);
});
