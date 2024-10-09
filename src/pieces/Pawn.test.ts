import { applyMoveTurnToGameState, getInitialGameState } from "../gameState";

test("Pawns cannot move through other pieces", () => {
  let state = getInitialGameState([
    [" ", " ", "K", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
    [" ", " ", "P", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
    [" ", "p", "k", " ", " ", " "],
  ]);

  state.selectedSquare = { r: 0, c: 1 };

  state = applyMoveTurnToGameState(state, { r: 1, c: 1 });

  console.log(JSON.stringify(state, null, 2));
});
