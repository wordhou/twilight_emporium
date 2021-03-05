import { CorruptedStateError, InvalidEditError } from "../lib/chain";
import { TwilightMap } from "../editor/twilightmap";
import {
  Result,
  TwilightMapState,
  TwilightMapEdit,
  TileIndex,
  Tile,
  ReversibleTwilightMapEdit,
  MapSection,
} from "../types";

class SetTiles implements ReversibleTwilightMapEdit {
  oldTiles: MapSection | undefined;
  newTiles: MapSection;
  reversible: boolean;
  constructor(sec: MapSection) {
    this.reversible = false;
    this.newTiles = sec;
  }

  forward(st: TwilightMapState): Result<void> {
    const sel = new Set(this.newTiles.keys());
    const sec = (st as TwilightMap).getMapSection(sel);
    if (sec instanceof Error) return; // TODO add error handling.
    this.oldTiles = sec;
    this.reversible = true;
    (st as TwilightMap).setTiles(this.newTiles);
    return; // TODO add error handling.
  }

  backward(st: TwilightMapState): Result<void> {
    if (this.reversible !== true) return; // TODO add error handling.
    (st as TwilightMap).setTiles(this.oldTiles as MapSection);
  }
}

class SetTile implements ReversibleTwilightMapEdit {
  oldTile: Tile | undefined; // TODO decide on tile representation
  newTile: Tile; // TODO decide on tile representation
  index: TileIndex;
  reversible: boolean;
  constructor(t: Tile, i: TileIndex) {
    this.newTile = t;
    this.index = i;
    this.reversible = false;
  }

  forward(st: TwilightMapState): Result<void> {
    const t = (st as TwilightMap).getTile(this.index);
    if (t instanceof Error) return new InvalidEditError(t.message);
    this.oldTile = t;
    this.reversible = true;
    return (st as TwilightMap).setTile(this.newTile, this.index);
  }

  backward(st: TwilightMapState): Result<void> {
    if (this.reversible !== true) return; // TODO add error handling.
    (st as TwilightMap).setTile(this.oldTile as Tile, this.index);
  }
}

class SwapTiles implements ReversibleTwilightMapEdit {
  i: TileIndex;
  j: TileIndex;
  reversible: boolean;

  constructor(i: TileIndex, j: TileIndex) {
    this.i = i;
    this.j = j;
    this.reversible = true;
  }

  forward(st: TwilightMapState): Result<void> {
    (st as TwilightMap).swapTiles(this.i, this.j); // TODO add error handling
  }

  backward(st: TwilightMapState): Result<void> {
    return this.forward(st);
  }
}

class SwapManyTiles implements ReversibleTwilightMapEdit {
  pairs: [TileIndex, TileIndex][];
  reversible: boolean;

  constructor(pairs: [TileIndex, TileIndex][]) {
    this.pairs = pairs;
    this.reversible = true;
  }

  forward(st: TwilightMapState): Result<void> {
    return (st as TwilightMap).swapManyTiles(this.pairs);
  }

  backward(st: TwilightMapState): Result<void> {
    return this.forward(st);
  }
}

class RotateTile implements ReversibleTwilightMapEdit {
  index: number;
  rotation: number;
  reversible: boolean;

  constructor(index: number, rotation: number) {
    this.index = index;
    this.rotation = rotation;
    this.reversible = true;
  }

  forward(st: TwilightMapState): Result<void> {
    return (st as TwilightMap).rotateTile(this.rotation, this.index);
  }

  backward(st: TwilightMapState): Result<void> {
    return (st as TwilightMap).rotateTile(-this.rotation, this.index);
  }
}

export { SetTiles, SetTile, SwapTiles, SwapManyTiles, RotateTile };
