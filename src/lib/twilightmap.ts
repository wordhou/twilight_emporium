import Tiles from "../lib/tiles";
import { State, CorruptedStateError } from "../lib/chain";
import { Tile, TileIndex, MapSection, Result } from "../types";

const SPACES = [1, 7, 19, 37, 61, 91, 127, 169, 217, 271]; // SPACES[n] = 3n(n+1) + 1
const MAX_RINGS = SPACES.length;
const MAX_TILE_INDEX = SPACES[MAX_RINGS - 1] - 1;

class TIMapArray implements State {
  rings: number;
  board: Uint16Array;
  constructor(input: number | Uint16Array) {
    if (input instanceof Uint16Array) {
      this.board = input;
      const n = input.length - 1;
      let r = 0;
      for (r = 0; 3 * r * (r + 1) < n; r++);
      this.rings = r;
      this.board = new Uint16Array(1 + 3 * this.rings * (this.rings + 1));
      for (let i = 0; i < input.length; i++) this.board[i] = input[i];
    } else {
      this.rings = input;
      this.board = new Uint16Array(1 + 3 * this.rings * (this.rings + 1));
    }
  }
  clone(): this {
    return new TIMapArray(this.board) as this;
  }

  get size(): number {
    return this.board.length;
  }

  /**
   * Resizes the array containing the tile values
   * @param r number of rings of spaces around the center tile
   * @returns void if successful
   */
  resize(r: number): Result<void> {
    if (!Number.isSafeInteger(r))
      return new Error("Number of rings must be an integer value");
    if (r < 1 || r >= SPACES.length)
      return new RangeError(
        `Number of rings can't be greater than ${MAX_RINGS}`
      );
    if (r === this.rings) return;
    if (r < this.rings) this.board = this.board.slice(0, SPACES[r]); // Shrink the board
    if (r > this.rings) {
      const newBoard = new Uint16Array(SPACES[r]);
      this.board.forEach((v, i) => (newBoard[i] = v));
      this.board = newBoard;
    }
    this.rings = r;
  }

  /**
   * Increases the size of the board by one ring. Returns RangeError if the
   * board is already its maximum size.
   */
  expand(): Result<void> {
    if (this.rings >= MAX_RINGS)
      return new RangeError(`Can't expand more than ${MAX_RINGS} rings`);
    return this.resize(this.rings + 1);
  }

  /**
   * Swaps the tiles at two indices
   */
  swapTiles(i: TileIndex, j: TileIndex): Result<void> {
    if (i >= this.board.length || j >= this.board.length)
      return new RangeError(`Tile indices ${i}, ${j} out of range`);
    const temp = this.board[i];
    this.board[i] = this.board[j];
    this.board[j] = temp;
  }

  /**
   * Swaps multiple pairs of tiles
   */
  swapManyTiles(pairs: [TileIndex, TileIndex][]): Result<void> {
    for (const p of pairs) {
      const err = this.swapTiles(...p);
      if (err instanceof Error)
        return new CorruptedStateError("Tile index out of range");
    }
  }

  /**
   * Rotates a tile by a specified number of turns
   * @param r Number of rotations clockwise by one-sixth of a full turn
   */
  rotateTile(r: number, i: TileIndex): Result<void> {
    this.board[i] = Tiles.rotate(this.board[i], r);
  }

  /**
   * Sets a number of tiles on the board at once.
   */
  setTiles(sec: MapSection): Result<void> {
    for (const [t, i] of sec.entries()) {
      const err = this.setTile(t, i);
      if (err instanceof Error)
        return new CorruptedStateError("Tile index out of range");
    }
  }

  /**
   * Sets the tile at index i.
   */
  setTile(t: Tile, i: TileIndex): Result<void> {
    if (i > MAX_TILE_INDEX) return new RangeError("Tile index out of range");
    while (i >= this.board.length) this.expand();
    this.board[i] = t;
  }

  resetTiles(tileIndices: Iterable<TileIndex>): Result<void> {
    for (const i of tileIndices) {
      if (i > MAX_TILE_INDEX)
        return new CorruptedStateError("Tile index out of range");
      const t = Tiles.fromTTSString(Tiles.getName(this.board[i]));
      if (t instanceof Error) return new CorruptedStateError(t.message);
      this.board[i] = t;
    }
  }

  /**
   * Creates a view of part of the board given by a selection of tile indices.
   */
  getMapSection(sel: Iterable<TileIndex>): Result<MapSection> {
    const sec: MapSection = new Map<TileIndex, Tile>();
    for (const i of sel) {
      if (i >= this.board.length)
        return new RangeError("Selection index out of range");
      sec.set(i, this.board[i]);
    }
    return sec;
  }

  getTile(i: TileIndex): Result<Tile> {
    return this.board[i];
  }

  getAdjacencyLists(): number[][] {
    // TODO
    return [];
  }

  static fromTTSString(tts: string): Result<TIMapArray> {
    const ttsTiles = tts.split(" "); // TODO what if they use commas?
    if (!/18(-[0-5])?/.test(ttsTiles[0])) ttsTiles.unshift("18");
    const board = new Uint16Array(ttsTiles.length);
    for (let i = 0; i < ttsTiles.length; i++) {
      const tile = Tiles.fromTTSString(ttsTiles[i]);
      if (tile instanceof Error) return tile;
      board[i] = tile;
    }
    return new TIMapArray(board);
  }
}

export default TIMapArray;
