import { Edit, ReversibleEdit } from "../lib/chain";
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
  static method = "setTiles";
  static params = ["newTiles"];

  oldTiles: MapSection;
  newTiles: MapSection;
  reversible: boolean;
  constructor(sec: MapSection) {
    this.reversible = false;
    this.newTiles = sec;
  }

  forward(st: TwilightMapState): void {
    const sel = new Set(this.newTiles.keys());
    const sec = (st as TwilightMap).getMapSection(sel);
    if (sec instanceof Error) return; // TODO add error handling.
    this.oldTiles = sec;
    this.reversible = true;
    (st as TwilightMap).setTiles(this.newTiles);
    return; // TODO add error handling.
  }

  backward(st: TwilightMapState): void {
    if (this.reversible !== true) return; // TODO add error handling.
    (st as TwilightMap).setTiles(this.oldTiles);
  }
}

class SetTile implements ReversibleTwilightMapEdit {
  static method = "setTile";
  static params = ["newTile"];

  oldTile: Tile; // TODO decide on tile representation
  newTile: Tile; // TODO decide on tile representation
  index: TileIndex;
  reversible: boolean;
  constructor(t: Tile, i: TileIndex) {
    this.newTile = t;
    this.index = i;
    this.reversible = false;
  }

  forward(st: TwilightMapState): void {
    /*
    const sec = (st as TwilightMap).getMapSection(sel);

    if (sec instanceof Error) return; // TODO add error handling.
    this.oldTiles = sec;
    this.reversible = true;
    (st as TwilightMap).setTiles(this.newTiles);
    return; // TODO add error handling.
    */
  }

  backward(st: TwilightMapState): void {
    if (this.reversible !== true) return; // TODO add error handling.
    (st as TwilightMap).setTile(this.oldTile, this.index);
  }
}

export { SetTiles, SetTile };
