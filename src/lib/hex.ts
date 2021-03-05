type AxialCoordinate = [number, number];
type CubeCoordinate = [number, number, number];

type HexMap<T> = Map<AxialCoordinate, T>;

function aToC(a: AxialCoordinate): CubeCoordinate {
  return [...a, -a[0] - a[1]];
}

function cToA(c: CubeCoordinate): AxialCoordinate {
  return [c[0], c[1]];
}

function axialNeighbors(a: AxialCoordinate): AxialCoordinate[] {
  return [
    [a[0] + 1, a[1] - 1],
    [a[0] - 1, a[1] + 1],
    [a[0] + 1, a[1]],
    [a[0] - 1, a[1]],
    [a[0], a[1] + 1],
    [a[0], a[1] - 1],
  ];
}

/*
class AxialHexMap<T> {
  map: HexMap<T>;
  vertices(): Iterator<AxialCoordinate> {
    return this.#map.keys();
  }
  neighbors(c: AxialCoordinate): AxialCoordinate[] {
    return axialNeighbors(c).filter((n) => this.#map.has(n));
  }
}
*/
