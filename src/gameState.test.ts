import { getInitialGameState, applyMoveTurnToGameState } from "./gameState";

test("Pieces can be moved", () => {
  let state = getInitialGameState([
    [" ", "P", "K"],
    [" ", " ", " "],
    [" ", "k", " "],
  ]);

  state.selectedSquare = { r: 0, c: 1 };

  state = applyMoveTurnToGameState(state, { r: 1, c: 1 });

  expect(JSON.stringify(state.board)).toEqual(
    JSON.stringify([
      [" ", " ", "K"],
      [" ", "P", " "],
      [" ", "k", " "],
    ])
  );
});
