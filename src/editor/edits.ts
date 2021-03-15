import { Edit, CorruptedStateError, InvalidEditError } from "../lib/chain";
import TIMapArray from "../lib/twilightmap";
import { Result, TileIndex, Tile, MapSection } from "../types";

type TileIndices = Iterable<TileIndex>;

class SetTiles implements Edit<TIMapArray> {
  oldTiles: MapSection | undefined;
  newTiles: MapSection;
  _reversible: boolean;
  constructor(sec: MapSection) {
    this._reversible = false;
    this.newTiles = sec;
  }

  forward(st: TIMapArray): Result<TileIndices> {
    const sel = new Set(this.newTiles.keys());
    const sec = st.getMapSection(sel);
    if (sec instanceof Error) return new InvalidEditError();
    this.oldTiles = sec;
    this._reversible = true;
    const err = st.setTiles(this.newTiles);
    if (err instanceof Error) return err;
    return this.newTiles.keys();
  }

  backward(st: TIMapArray): Result<TileIndices> {
    if (this._reversible !== true)
      return new InvalidEditError(
        "Can't reverse setTiles before it's been performed"
      );
    const err = st.setTiles(this.oldTiles as MapSection);
    if (err instanceof Error) return err;
    return this.newTiles.keys();
  }

  get reversible(): boolean {
    return this._reversible;
  }
}

class SetTile implements Edit<TIMapArray> {
  oldTile: Tile | undefined;
  newTile: Tile;
  index: TileIndex;
  _reversible: boolean;
  constructor(t: Tile, i: TileIndex) {
    this.newTile = t;
    this.index = i;
    this._reversible = false;
  }

  forward(st: TIMapArray): Result<TileIndices> {
    const t = st.getTile(this.index);
    if (t instanceof Error) return new InvalidEditError(t.message);
    this.oldTile = t;
    this._reversible = true;
    const err = st.setTile(this.newTile, this.index);
    if (err instanceof Error) return err;
    return [this.index];
  }

  backward(st: TIMapArray): Result<TileIndices> {
    if (this._reversible !== true) return new InvalidEditError();
    const err = st.setTile(this.oldTile as Tile, this.index);
    if (err instanceof Error) return err;
    return [this.index];
  }

  get reversible(): boolean {
    return this._reversible;
  }
}

class SwapTiles implements Edit<TIMapArray> {
  i: TileIndex;
  j: TileIndex;

  constructor(i: TileIndex, j: TileIndex) {
    this.i = i;
    this.j = j;
  }

  forward(st: TIMapArray): Result<TileIndices> {
    const err = st.swapTiles(this.i, this.j);
    if (err instanceof Error) return err;
    return [this.i, this.j];
  }

  backward(st: TIMapArray): Result<TileIndices> {
    return this.forward(st);
  }

  get reversible(): boolean {
    return true;
  }
}

class SwapManyTiles implements Edit<TIMapArray> {
  pairs: [TileIndex, TileIndex][];

  constructor(pairs: [TileIndex, TileIndex][]) {
    this.pairs = pairs;
  }

  forward(st: TIMapArray): Result<TileIndices> {
    const err = st.swapManyTiles(this.pairs);
    if (err instanceof CorruptedStateError) return err;
    return this.pairs.flat();
  }

  backward(st: TIMapArray): Result<TileIndices> {
    return this.forward(st);
  }

  get reversible(): boolean {
    return true;
  }
}

class RotateTile implements Edit<TIMapArray> {
  index: number;
  rotation: number;

  constructor(index: number, rotation: number) {
    this.index = index;
    this.rotation = rotation;
  }

  forward(st: TIMapArray): Result<TileIndices> {
    const err = st.rotateTile(this.rotation, this.index);
    if (err instanceof CorruptedStateError) return err;
    return [this.index];
  }

  backward(st: TIMapArray): Result<TileIndices> {
    const err = st.rotateTile(-this.rotation, this.index);
    if (err instanceof CorruptedStateError) return err;
    return [this.index];
  }

  get reversible(): boolean {
    return true;
  }
}

class ResetTiles implements Edit<TIMapArray> {
  selection: Iterable<TileIndex>;
  oldTiles?: MapSection;
  _reversible: boolean;

  constructor(selection: Iterable<TileIndex>) {
    this.selection = selection;
    this._reversible = false;
  }

  forward(st: TIMapArray): Result<TileIndices> {
    const sec = st.getMapSection(this.selection);
    if (sec instanceof Error) return new InvalidEditError();
    this.oldTiles = sec;
    this._reversible = true;
    const err = st.resetTiles(this.selection);
    if (err instanceof Error) return err;
    return this.selection;
  }

  get reversible(): boolean {
    return this._reversible;
  }

  backward(st: TIMapArray): Result<TileIndices> {
    if (this._reversible !== true)
      return new InvalidEditError(
        "Can't reverse resetTiles before it's been performed"
      );
    const err = st.setTiles(this.oldTiles as MapSection);
    if (err instanceof Error) return err;
    return this.selection;
  }
}

class Resize implements Edit<TIMapArray> {
  oldTiles: MapSection | undefined;
  rings: number;
  _reversible: boolean;
  constructor(rings: number) {
    this._reversible = false;
    this.rings = rings;
  }

  forward(st: TIMapArray): Result<void> {
    return st.resize(st.rings + this.rings);
  }

  backward(st: TIMapArray): Result<void> {
    return st.resize(st.rings - this.rings);
  }

  get reversible(): boolean {
    return this._reversible;
  }
}

export {
  SetTiles,
  SetTile,
  SwapTiles,
  SwapManyTiles,
  RotateTile,
  ResetTiles,
  Resize,
};
