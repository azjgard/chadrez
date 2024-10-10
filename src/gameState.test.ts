import { serializeBoard, deserializeBoard, DEFAULT_BOARD } from "./gameState";

test("board serialization / de-serialization is bi-directional", () => {
  const deserialized = deserializeBoard(DEFAULT_BOARD);
  const serialized = serializeBoard(deserialized);
  expect(serialized).toEqual(DEFAULT_BOARD);
});
