import { Result, rotation, face, Tile } from "../types";

const NEG_ONE = 0b1111111;

/**
 * Stores a tile as a 12bit integer
 */
function newTile(n: number, r?: rotation, f?: face): Tile {
  const fb = f === "A" ? 1 : f === "B" ? 2 : 0;
  const rb = r === undefined ? 6 : r;
  const nb = n === -1 ? NEG_ONE : n;
  return (nb << 5) | (rb << 2) | fb;
}

function fromTTSString(s: string): Result<Tile> {
  const re = /(-?\d+)(A|B)?(?:-([0-5]))?/.exec(s);
  if (re === null) return Error("Invalid TTS string");
  const n = parseInt(re[1]);
  const r = re[3] === undefined ? undefined : (parseInt(re[3]) as rotation);
  const f = re[2] as face;
  return newTile(n, r, f);
}

/**
 * Represents a tile in the format used by the Twilight Imperium Tabletop Simulator mod
 * -1 represents an unused tile location
 * 0 represents an unspecified player home system
 * 1 - 82 represent board tiles that can only be placed face up (no flip)
 * 83-92 are hyperlane tiles, and need an A or a B to indicate which face is up, and a rotation.
 */
function toTTSString(t: Tile): string {
  const n = getNumber(t);
  const r = getRotation(t);
  const f = getFace(t);
  if (n === NEG_ONE) return "-1";
  return `${n}${f !== undefined ? f : ""}${r !== undefined ? `-${r}` : ""}`;
}

function getNumber(t: Tile): number {
  const n = (t >> 5) & 0b1111111;
  return n === 127 ? -1 : n;
}

function getRotation(t: Tile): rotation {
  const rb = (t >> 2) & 0b111;
  return rb > 5 ? undefined : (rb as rotation);
}

function getFace(t: Tile): face {
  const f = t & 0b11;
  return f === 1 ? "A" : f === 2 ? "B" : undefined;
}

function setNumber(t: Tile, num: number): Tile {
  return (t & 0b11111) | (num << 5);
}

function setRotation(t: Tile, r: rotation): Tile {
  const bits = r === undefined ? 6 : r;
  return (t & ~0b11100) | (bits << 2);
}

function setFace(t: Tile, f: face): Tile {
  if (f === "A") return (t & ~0b11) | 0b01;
  if (f === "B") return (t & ~0b11) | 0b10;
  return t & ~0b11;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function rotate(t: Tile, r: number): Tile {
  const orientation = ((b) => (b > 5 ? 0 : b))((t & 0b11100) >> 2);
  const bits = mod(orientation + r, 6);
  return (t & ~0b11100) | (bits << 2);
}

export default {
  newTile,
  toTTSString,
  fromTTSString,
  getNumber,
  setNumber,
  getFace,
  setFace,
  getRotation,
  setRotation,
  rotate,
};
