import {
  State,
  Edit,
  CorruptedStateError,
  InvalidEditError,
} from "../lib/chain";
import { TwilightMap } from "../editor/twilightmap";
import { Result, TileIndex, Tile, MapSection } from "../types";

class SetTiles implements Edit<TwilightMap> {
  oldTiles: MapSection | undefined;
  newTiles: MapSection;
  _reversible: boolean;
  constructor(sec: MapSection) {
    this._reversible = false;
    this.newTiles = sec;
  }

  forward(st: TwilightMap): Result<void> {
    const sel = new Set(this.newTiles.keys());
    const sec = st.getMapSection(sel);
    if (sec instanceof Error) return new InvalidEditError(); // TODO add error handling.
    this.oldTiles = sec;
    this._reversible = true;
    return st.setTiles(this.newTiles);
  }

  backward(st: TwilightMap): Result<void> {
    if (this._reversible !== true)
      return new InvalidEditError(
        "Can't reverse setTiles before it's been performed"
      );
    return st.setTiles(this.oldTiles as MapSection);
  }

  get reversible(): boolean {
    return this._reversible;
  }
}

class SetTile implements Edit<TwilightMap> {
  oldTile: Tile | undefined; // TODO decide on tile representation
  newTile: Tile; // TODO decide on tile representation
  index: TileIndex;
  _reversible: boolean;
  constructor(t: Tile, i: TileIndex) {
    this.newTile = t;
    this.index = i;
    this._reversible = false;
  }

  forward(st: TwilightMap): Result<void> {
    const t = st.getTile(this.index);
    if (t instanceof Error) return new InvalidEditError(t.message);
    this.oldTile = t;
    this._reversible = true;
    return st.setTile(this.newTile, this.index);
  }

  backward(st: TwilightMap): Result<void> {
    if (this._reversible !== true) return; // TODO add error handling.
    st.setTile(this.oldTile as Tile, this.index);
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

  forward(st: TwilightMap): Result<void> {
    return st.swapTiles(this.i, this.j);
  }

  backward(st: TwilightMap): Result<void> {
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

  forward(st: TwilightMap): Result<void> {
    return st.swapManyTiles(this.pairs);
  }

  backward(st: TwilightMap): Result<void> {
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

  forward(st: TwilightMap): Result<void> {
    return st.rotateTile(this.rotation, this.index);
  }

  backward(st: TwilightMap): Result<void> {
    return st.rotateTile(-this.rotation, this.index);
  }

  get reversible(): boolean {
    return true;
  }
}

export { SetTiles, SetTile, SwapTiles, SwapManyTiles, RotateTile };
