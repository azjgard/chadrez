import { createBoard, getInitialGameState } from "../gameState";
import { posToKey } from "../lib";

test("Pawns can move one or two spaces off their starting square", () => {
  const state = getInitialGameState(
    createBoard([
      [" ", " ", "K"],
      [" ", "P", " "],
      [" ", " ", " "],
      [" ", " ", " "],
      [" ", "k", " "],
    ])
  );

  const validPawnMoves = state.validMovesFromPosition.get(
    posToKey({ r: 1, c: 1 })
  )!;
  expect(validPawnMoves.size).toBe(2);
  expect(validPawnMoves.has(posToKey({ r: 2, c: 1 }))).toBe(true);
  expect(validPawnMoves.has(posToKey({ r: 3, c: 1 }))).toBe(true);
});

test("Pawns cannot move through pieces", () => {
  const state = getInitialGameState([
    [" ", "P", "K"],
    [" ", "k", " "],
  ]);
  const validPawnMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validPawnMoves.size).toBe(0);
});

test("Pawns can capture diagonally", () => {
  const state = getInitialGameState([
    [" ", "P", "K"],
    ["p", "k", "p"],
  ]);
  const validPawnMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validPawnMoves.size).toBe(2);
  expect(validPawnMoves.has(posToKey({ r: 1, c: 0 }))).toBe(true);
  expect(validPawnMoves.has(posToKey({ r: 1, c: 2 }))).toBe(true);
});

test.only("Pawns cannot move such that their own king is put in check", () => {
  const state = getInitialGameState([
    ["r", "P", "K"],
    [" ", " ", " "],
    [" ", "k", " "],
  ]);
  const validPawnMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validPawnMoves.size).toBe(0);
});

test("Pawns can capture diagonally", () => {
  const state = getInitialGameState([
    [" ", "P", "K"],
    ["p", "k", "p"],
  ]);
  const validPawnMoves = state.validMovesFromPosition.get(
    posToKey({ r: 0, c: 1 })
  )!;
  expect(validPawnMoves.size).toBe(2);
  expect(validPawnMoves.has(posToKey({ r: 1, c: 0 }))).toBe(true);
  expect(validPawnMoves.has(posToKey({ r: 1, c: 2 }))).toBe(true);
});
