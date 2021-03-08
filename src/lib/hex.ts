type Hex = [number, number];
type HexMap<T> = Map<Hex, T>;

function HexNeighbors(a: Hex): Hex[] {
  return [
    [a[0] + 1, a[1] - 1],
    [a[0] - 1, a[1] + 1],
    [a[0] + 1, a[1]],
    [a[0] - 1, a[1]],
    [a[0], a[1] + 1],
    [a[0], a[1] - 1],
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

export function spiralToHex(n: number): Hex {
  if (n === 0) return O;
  let r;
  for (r = 0; 3 * r * (r + 1) < n; r++);
  const i = n - 3 * r * (r - 1) - 1;
  const dir = Math.trunc(i / r);
  return goHex(goHex(O, dir, r), dir + 2, i % r);
}

export function hexToXY([q, r]: Hex, w: number, h?: number): [number, number] {
  const dy = 0.8660254037844386;
  h = h === undefined ? dy * w : h;
  return [0.75 * w * q, (r - 0.5 * q) * h];
}

export function spiralToXY(n: number, w: number, h?: number): [number, number] {
  return hexToXY(spiralToHex(n), w, h);
}
