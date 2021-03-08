import { Tile } from "../lib/tile";
import { State } from "../lib/chain";

const SPACES = [1, 7, 19, 37, 61, 91, 127, 169, 217, 271]; // SPACES[n] = 3n(n+1) + 1

type TwilightMapState = State<"TM">;

class TwilightMap implements TwilightMapState {
  rings: number;
  board: Uint16Array;
  constructor(rings = 4, board?: Uint16Array) {
    this.rings = rings;
    this.board =
      board === undefined
        ? new Uint16Array(1 + 3 * rings * (rings + 1))
        : board;
  }
  clone(): TwilightMap {
    return new TwilightMap(this.rings, this.board);
  }

  /**
   * Resizes the array containing the tile values
   */
  resize(n: number): boolean {
    if (n < 1 || n >= SPACES.length || !Number.isSafeInteger(n)) return false; // Error?
    if (n === this.rings) return true;
    if (n < this.rings) this.board = this.board.slice(0, SPACES[n]); // Shrink the board
    if (n > this.rings) {
      const newBoard = new Uint16Array(SPACES[n]);
      this.board.forEach((v, i) => (newBoard[i] = v));
      this.board = newBoard;
    }
    return true;
  }

  swap(i: number, j: number): boolean {
    return true;
  }

  setUint16(i: number, t: number): boolean {
    return true;
  }

  rotate(i: number, r: number): boolean {
    return true;
  }
}

export { TwilightMap };
