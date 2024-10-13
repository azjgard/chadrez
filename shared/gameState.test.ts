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

test("Check is properly detected", () => {
  expect(
    getInitialGameState([
      [" ", " ", "K"],
      [" ", "p", " "],
      [" ", "k", " "],
    ]).condition
  ).toBe("check");

  expect(
    getInitialGameState([
      ["r", " ", "K", " "],
      [" ", " ", " ", " "],
      [" ", " ", " ", " "],
      [" ", "k", " ", " "],
    ]).condition
  ).toBe("check");
});

test("Checkmate is properly detected", () => {
  expect(
    getInitialGameState([
      ["r", " ", "K"],
      [" ", " ", " "],
      [" ", "k", " "],
    ]).condition
  ).toBe("checkmate");
});

test("Stalemate is properly detected", () => {
  expect(
    getInitialGameState([
      [" ", " ", "K"],
      [" ", "r", " "],
      ["k", "r", " "],
    ]).condition
  ).toBe("stalemate");

  expect(
    getInitialGameState([
      ["P", " ", "K"],
      [" ", "r", " "],
      ["k", "r", " "],
    ]).condition
  ).toBe(null);
});
