export type Hex = [number, number];
type HexMap<T> = Map<Hex, T>;

function hexNeighbors([q, r]: Hex): Hex[] {
  return [
    [q, r + 1],
    [q + 1, r + 1],
    [q + 1, r],
    [q, r - 1],
    [q - 1, r - 1],
    [q - 1, r],
  ];
}

const O: Hex = [0, 0];

function goHex([q, r]: Hex, dir: number, n = 1): Hex {
  return [
    [q, r + n],
    [q + n, r + n],
    [q + n, r],
    [q, r - n],
    [q - n, r - n],
    [q - n, r],
  ][dir % 6] as Hex;
}

function spiralToHex(n: number): Hex {
  if (n === 0) return O;
  let r;
  for (r = 0; 3 * r * (r + 1) < n; r++);
  const i = n - 3 * r * (r - 1) - 1;
  const dir = Math.trunc(i / r);
  return goHex(goHex(O, dir, r), dir + 2, i % r);
}

function hexToXY([q, r]: Hex, w: number, h?: number): [number, number] {
  const dy = 0.8660254037844386;
  h = h === undefined ? dy * w : h;
  return [0.75 * w * q, (r - 0.5 * q) * h];
}

const MAX_TILE_INDEX = 271;

export const _spiralToHex = Array(MAX_TILE_INDEX)
  .fill(null)
  .map((_, n) => spiralToHex(n));

export const _hexToSpiral = new Map(
  _spiralToHex.map((hex, n) => [hex.toString(), n])
);

export const _spiralNeighbors = _spiralToHex
  .map(hexNeighbors)
  .map(
    (hs) =>
      hs
        .map((h) => _hexToSpiral.get(h.toString()))
        .filter((h) => h !== undefined) as number[]
  );

export function spiralToXY(n: number, w: number, h?: number): [number, number] {
  return hexToXY(spiralToHex(n), w, h);
}

export function neighbors(n: number, max = MAX_TILE_INDEX): number[] {
  if (n >= max) throw new Error("n exceeds maximum tile index");
  return _spiralNeighbors[n];
}

export function difference(n: number, m: number): Hex {
  const [[q1, r1], [q2, r2]] = [_spiralToHex[n], _spiralToHex[m]];
  return [q1 - q2, r1 - r2];
}

export function addTo(
  [q, r]: Hex,
  n: number,
  max = MAX_TILE_INDEX
): number | undefined {
  const [q1, r1] = _spiralToHex[n];
  const n1 = _hexToSpiral.get([q1 + q, r1 + r].toString());
  return n1 === undefined || n1 >= max ? undefined : n1;
}

export function shiftSelection(
  initial: number,
  final: number,
  selection: number[],
  max = MAX_TILE_INDEX
): number[] {
  const diff = difference(final, initial);
  return selection
    .map((i) => addTo(diff, i, max))
    .filter((i) => i !== undefined) as number[];
}

export function addDragShape(shape: Hex[], n: number, max?: number): number[] {
  return shape
    .map((hex) => addTo(hex, n, max))
    .filter((x) => x !== undefined) as number[];
}
