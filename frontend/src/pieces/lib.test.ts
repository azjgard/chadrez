import { createBoard } from "../gameState";
import { IPosition, posToKey } from "../lib";
import { createPotentialMoves } from "./lib";

describe("createPotentialMoves", () => {
  it("allows valid moves", () => {
    const board = createBoard([
      [" ", "p", "k"],
      [" ", " ", " "],
      [" ", "K", " "],
    ]);

    const pos = { r: 0, c: 1 };
    const potentialMoves: IPosition[] = [{ r: 1, c: 1 }];

    expect(
      createPotentialMoves(board, pos, potentialMoves, "move", {
        [posToKey(pos)]: [],
      })
    ).toEqual([{ r: 1, c: 1 }]);
  });

  it("filters out moves off board", () => {
    const board = createBoard([
      [" ", "p", "k"],
      [" ", " ", " "],
      [" ", "K", " "],
    ]);

    const pos = { r: 0, c: 1 };
    const potentialMoves: IPosition[] = [
      { r: -1, c: 1 },
      { r: -1, c: 1 },
      { r: 10, c: 0 },
      { r: 1, c: 10 },
    ];

    expect(
      createPotentialMoves(board, pos, potentialMoves, "move", {
        [posToKey(pos)]: [{ r: 0, c: 0 }],
      })
    ).toEqual([]);
  });

  it("filters out moves that would put king in danger", () => {
    const board = createBoard([
      ["R", "p", "k"],
      [" ", " ", " "],
      [" ", "K", " "],
    ]);

    const pos = { r: 0, c: 1 };
    const potentialMoves: IPosition[] = [{ r: 1, c: 1 }];
    const positionsTargetingPos = {
      [posToKey(pos)]: [{ r: 0, c: 0 }],
    };

    expect(
      createPotentialMoves(
        board,
        pos,
        potentialMoves,
        "move",
        positionsTargetingPos
      )
    ).toEqual([]);
  });
});
