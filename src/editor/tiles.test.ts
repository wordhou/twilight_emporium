import Tiles from "./tiles";
import { rotation, face } from "../types";

const numbers = [0, 1, 126, -1];
const faces: face[] = ["A", "B", undefined];
const rotations: rotation[] = [0, 1, 2, 3, 4, 5, undefined];

const tiles = numbers.flatMap((n) =>
  rotations.flatMap((r) => faces.flatMap((f) => Tiles.newTile(n, r, f)))
);

const newTileParams: [number, rotation, face][] = [
  [5, undefined, undefined],
  [5, 4, undefined],
  [83, 0, "A"],
  [84, 4, "B"],
  [-1, undefined, undefined],
  [88, undefined, "B"],
];

const TTSStrings = ["5", "5-4", "83A-0", "83A-4", "-1", "88B"];

describe("getNumber", () => {
  test("gets number", () => {
    numbers.forEach((n) => {
      expect(Tiles.getNumber(Tiles.newTile(n)) === n);
    });
  });
});
describe("getRotation", () => {
  test("gets rotation", () => {
    numbers.forEach((n) => {
      rotations.forEach((r) => {
        expect(Tiles.getRotation(Tiles.newTile(n, r)) === r);
        expect(Tiles.getRotation(Tiles.newTile(n, r, "A")) === r);
        expect(Tiles.getRotation(Tiles.newTile(n, r, "B")) === r);
      });
    });
  });
});
describe("getFace", () => {
  test("gets face", () => {
    numbers.forEach((n) => {
      faces.forEach((f) => {
        expect(Tiles.getFace(Tiles.newTile(n, undefined, f)) === f);
        expect(Tiles.getFace(Tiles.newTile(n, 0, f)) === f);
        expect(Tiles.getFace(Tiles.newTile(n, 5, f)) === f);
      });
    });
  });
});
describe("setNumber", () => {
  test("sets number", () => {
    tiles.forEach((t) => {
      numbers.forEach((n) => {
        Tiles.getNumber(Tiles.setNumber(t, n)) == n;
      });
    });
  });
  test.todo("doesn't change other items");
});
describe("setRotation", () => {
  test("sets rotation", () => {
    tiles.forEach((t) => {
      rotations.forEach((r) => {
        Tiles.getRotation(Tiles.setRotation(t, r)) == r;
      });
    });
  });
  test.todo("doesn't change other items");
});
describe("setFace", () => {
  test("sets face", () => {
    tiles.forEach((t) => {
      faces.forEach((f) => {
        Tiles.getFace(Tiles.setFace(t, f)) == f;
      });
    });
  });
  test.todo("doesn't change other items");
});

describe("toTTSString", () => {
  test("properly converts to TTS format", () => {
    const res = newTileParams
      .map((params) => Tiles.newTile(...params))
      .map((t) => Tiles.toTTSString(t));
    expect(res).toStrictEqual(TTSStrings);
  });
});

describe("fromTTSString", () => {
  const params = TTSStrings.map(
    (s) => Tiles.fromTTSString(s) as number
  ).map((t) => [Tiles.getNumber(t), Tiles.getRotation(t), Tiles.getFace(t)]);
  test("properly converts from TTS format", () => {
    expect(params).toStrictEqual(newTileParams);
  });
});

describe("rotate", () => {
  test("changes the rotation of a tile", () => {});
});
