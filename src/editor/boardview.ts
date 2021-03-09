import { Result, Tile, TileIndex } from "../types";
import { EditHistory } from "../lib/chain";
import TwilightMap from "../lib/twilightmap";
import * as Hex from "../lib/hex";
import Tiles from "../lib/tiles";
import { EditorState } from "./editorstate";

type TileSelection = Iterable<number>;

interface Settings {
  tileHeight: number;
  tileWidth: number;
  tileNumberOverlay: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  tileWidth: 364,
  tileHeight: 317,
  tileNumberOverlay: false,
};

interface BoardView extends Settings {
  target: HTMLElement;
}

class BoardView {
  tileWrappers: HTMLElement[];
  editorState: EditorState;
  editHistory: EditHistory<TwilightMap>;
  boardWidth!: number;
  boardHeight!: number;
  topOffset!: number;
  leftOffset!: number;

  get current(): TwilightMap {
    return this.editHistory.current;
  }

  constructor(
    target: HTMLElement,
    editHistory: EditHistory<TwilightMap>,
    editorState: EditorState,
    settings: Settings = DEFAULT_SETTINGS
  ) {
    this.target = target;
    this.editHistory = editHistory;
    this.editorState = editorState;
    this.tileWrappers = [];
    this.tileWidth = settings.tileWidth;
    this.tileHeight = settings.tileHeight;
    this.tileNumberOverlay = settings.tileNumberOverlay;
    this._setBoardWidth();
  }

  _setBoardWidth(): Result<void> {
    const r = this.current.rings;
    this.boardWidth = this.tileWidth * (1 + 1.5 * r);
    this.boardHeight = this.tileHeight * (1 + 2 * r);
    this.target.style.width = `${this.boardWidth}px`;
    this.target.style.height = `${this.boardHeight}px`;
    this.topOffset = 0.5 * this.boardHeight - 0.5 * this.tileHeight;
    this.leftOffset = 0.5 * this.boardWidth - 0.5 * this.tileWidth;
  }

  draw(): this {
    this.current.board.forEach((t, i) => {
      if (i >= this.tileWrappers.length) this.addTileWrapper(i);
      this.drawTile(t, i);
    });
    return this;
  }

  update(st: EditorState, indices: Iterable<TileIndex>): this {
    console.log("Updating tiles", indices);
    this.editorState = st;
    for (const i of indices) {
      if (i < this.current.size) {
        if (i >= this.tileWrappers.length) this.addTileWrapper(i);
        this.drawTile(this.current.board[i], i);
      }
    }
    return this;
  }

  drawTile(tile: number, index: number): this {
    const div = this.tileWrappers[index];
    if (div === undefined)
      throw Error(`Tile with index ${index} does not exist.`);
    const name = Tiles.getName(tile);
    const rotation = Tiles.getRotation(tile);
    const r = rotation === undefined ? 0 : rotation * 60;
    const img = ((i) =>
      i === null ? div.appendChild(document.createElement("img")) : i)(
      div.querySelector("img")
    );
    img.classList.add("tile-img");
    div.classList.toggle("selected", has(this.editorState.selection, index));
    div.classList.toggle("droptarget", has(this.editorState.dropTarget, index));

    img.src = `tiles/large/ST_${name}.png`;
    img.style.transform = `rotate(${r}deg)`;

    return this;
  }

  addTileWrapper(index: number): Result<HTMLElement> {
    const div = document.createElement("div");
    div.classList.add("tile-wrapper");
    div.setAttribute("draggable", "true");
    div.dataset.i = `${index}`;
    const [x, y] = Hex.spiralToXY(index, this.tileWidth, this.tileHeight);
    div.style.width = `${this.tileWidth}px`;
    div.style.height = `${this.tileHeight}px`;
    div.style.top = `${this.topOffset - y}px`;
    div.style.left = `${this.leftOffset + x}px`;
    this.target.appendChild(div);
    this.tileWrappers[index] = div;
    return div;
  }
}

function has<T>(it: Iterable<T>, item: T): boolean {
  if (it instanceof Array) return it.includes(item);
  if (it instanceof Set) return it.has(item);
  if (it instanceof Map) return it.has(item);
  if (it instanceof Uint16Array && typeof item === "number")
    return it.includes(item);
  for (const i of it) if (i === item) return true;
  return false;
}

export default BoardView;
