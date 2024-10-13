import { getInitialGameState } from "../gameState";
import { posToKey } from "../lib";

test("King can move normally", () => {
  const state = getInitialGameState([
    [" ", "K", " "],
    [" ", " ", " "],
    [" ", " ", " "],
    [" ", "k", " "],
  ]);
  const validMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validMoves.size).toBe(5);
});

// Fixed by differentiating between "valid move targets" and "valid capture targets",
// whereas previously they were treated as one and the same -- the King couldn't move
// side to side due to the pawns being able to move there.
test("regression: King can move side to side", () => {
  const state = getInitialGameState([
    [" ", "K", " "],
    [" ", " ", " "],
    ["p", "p", "p"],
    [" ", "k", " "],
  ]);
  const validMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validMoves.size).toBe(2);
  expect(validMoves.has(posToKey({ r: 0, c: 0 }))).toBe(true);
  expect(validMoves.has(posToKey({ r: 0, c: 2 }))).toBe(true);
});

test("regression: irrelevant pieces cannot move while king is in check", () => {
  const state = getInitialGameState([
    ["R", "N", "B", "K", " ", "B", "N", "R"],
    ["P", "P", "P", " ", " ", "P", "P", "P"],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", "Q", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", "p", " ", " "],
    ["p", "p", "p", " ", " ", "p", " ", "p"],
    ["r", "n", "b", "k", " ", "b", " ", "r"],
  ]);
  const validMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validMoves.size).toBe(2);
  expect(validMoves.has(posToKey({ r: 0, c: 0 }))).toBe(true);
  expect(validMoves.has(posToKey({ r: 0, c: 2 }))).toBe(true);
});

test("King cannot move self into check", () => {
  const state = getInitialGameState([
    [" ", "K", " "],
    [" ", " ", " "],
    [" ", "k", " "],
  ]);
  const validMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validMoves.size).toBe(2);
  expect(validMoves.has(posToKey({ r: 0, c: 0 }))).toBe(true);
  expect(validMoves.has(posToKey({ r: 0, c: 2 }))).toBe(true);
});
