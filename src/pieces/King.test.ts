import { getInitialGameState } from "../gameState";
import { posToKey } from "../lib";
test("King can move normally", () => {
  const state = getInitialGameState([
    [" ", "K", " "],
    [" ", " ", " "],
    [" ", " ", " "],
    [" ", "k", " "],
  ]);
  const validPawnMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validPawnMoves.size).toBe(5);
});

test("King cannot move self into check", () => {
  const state = getInitialGameState([
    [" ", "K", " "],
    [" ", " ", " "],
    [" ", "k", " "],
  ]);
  const validPawnMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validPawnMoves.size).toBe(2);
  expect(validPawnMoves.has(posToKey({ r: 0, c: 0 }))).toBe(true);
  expect(validPawnMoves.has(posToKey({ r: 0, c: 2 }))).toBe(true);
});
