import {
  serializeBoard,
  deserializeBoard,
  DEFAULT_BOARD,
  getInitialGameState,
  applyMoveTurnToGameState,
} from "./gameState";

test("board serialization / de-serialization is bi-directional", () => {
  const deserialized = deserializeBoard(DEFAULT_BOARD);
  const serialized = serializeBoard(deserialized);
  expect(serialized).toEqual(DEFAULT_BOARD);
});

test("Pieces can be moved", () => {
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
