import { Edit, CorruptedStateError, InvalidEditError } from "../lib/chain";
import TwilightMap from "../lib/twilightmap";
import { Result, TileIndex, Tile, MapSection } from "../types";

type IndexList = number[];

class SetTiles implements Edit<TwilightMap> {
  oldTiles: MapSection | undefined;
  newTiles: MapSection;
  _reversible: boolean;
  constructor(sec: MapSection) {
    this._reversible = false;
    this.newTiles = sec;
  }

  forward(st: TwilightMap): Result<IndexList> {
    const sel = new Set(this.newTiles.keys());
    const sec = st.getMapSection(sel);
    if (sec instanceof Error) return new InvalidEditError();
    this.oldTiles = sec;
    this._reversible = true;
    const err = st.setTiles(this.newTiles);
    if (err instanceof Error) return err;
    return Array.from(this.newTiles.keys());
  }

  backward(st: TwilightMap): Result<IndexList> {
    if (this._reversible !== true)
      return new InvalidEditError(
        "Can't reverse setTiles before it's been performed"
      );
    const err = st.setTiles(this.oldTiles as MapSection);
    if (err instanceof Error) return err;
    return Array.from(this.newTiles.keys());
  }

  get reversible(): boolean {
    return this._reversible;
  }
}

class SetTile implements Edit<TwilightMap> {
  oldTile: Tile | undefined;
  newTile: Tile;
  index: TileIndex;
  _reversible: boolean;
  constructor(t: Tile, i: TileIndex) {
    this.newTile = t;
    this.index = i;
    this._reversible = false;
  }

  forward(st: TwilightMap): Result<IndexList> {
    const t = st.getTile(this.index);
    if (t instanceof Error) return new InvalidEditError(t.message);
    this.oldTile = t;
    this._reversible = true;
    const err = st.setTile(this.newTile, this.index);
    if (err instanceof Error) return err;
    return [this.index];
  }

  backward(st: TwilightMap): Result<IndexList> {
    if (this._reversible !== true) return new InvalidEditError();
    const err = st.setTile(this.oldTile as Tile, this.index);
    if (err instanceof Error) return err;
    return [this.index];
  }

  get reversible(): boolean {
    return this._reversible;
  }
}

class SwapTiles implements Edit<TwilightMap> {
  i: TileIndex;
  j: TileIndex;

  constructor(i: TileIndex, j: TileIndex) {
    this.i = i;
    this.j = j;
  }

  forward(st: TwilightMap): Result<IndexList> {
    const err = st.swapTiles(this.i, this.j);
    if (err instanceof Error) return err;
    return [this.i, this.j];
  }

  backward(st: TwilightMap): Result<IndexList> {
    return this.forward(st);
  }

  get reversible(): boolean {
    return true;
  }
}

class SwapManyTiles implements Edit<TwilightMap> {
  pairs: [TileIndex, TileIndex][];

  constructor(pairs: [TileIndex, TileIndex][]) {
    this.pairs = pairs;
  }

  forward(st: TwilightMap): Result<IndexList> {
    const err = st.swapManyTiles(this.pairs);
    if (err instanceof CorruptedStateError) return err;
    return this.pairs.flat();
  }

  backward(st: TwilightMap): Result<IndexList> {
    return this.forward(st);
  }

  get reversible(): boolean {
    return true;
  }
}

class RotateTile implements Edit<TwilightMap> {
  index: number;
  rotation: number;

  constructor(index: number, rotation: number) {
    this.index = index;
    this.rotation = rotation;
  }

  forward(st: TwilightMap): Result<IndexList> {
    const err = st.rotateTile(this.rotation, this.index);
    if (err instanceof CorruptedStateError) return err;
    return [this.index];
  }

  backward(st: TwilightMap): Result<IndexList> {
    const err = st.rotateTile(-this.rotation, this.index);
    if (err instanceof CorruptedStateError) return err;
    return [this.index];
  }

  get reversible(): boolean {
    return true;
  }
}

export { SetTiles, SetTile, SwapTiles, SwapManyTiles, RotateTile };
