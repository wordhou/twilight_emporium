import { Result, Tile, TileIndex } from "../types";
import { EditHistory } from "../lib/chain";
import TwilightMap from "../lib/twilightmap";
import * as Hex from "../lib/hex";
import Tiles from "../lib/tiles";
import { EditorState } from "./editorstate";
import TileControls from "./tilecontrols";
import "./boardview.css";

type TileSelection = Iterable<number>;
export type UpdatableElem = "tileControls" | "unusedTiles" | "boardSize";
export type UpdateList = Iterable<number | UpdatableElem>;

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

interface BoardView extends Settings {}

class BoardView {
  target!: HTMLElement;
  tileWrappers: HTMLElement[];
  editorState: EditorState;
  editHistory: EditHistory<TwilightMap>;
  nodes!: Record<string, HTMLElement>;
  components!: Record<string, { render: (t: HTMLElement) => unknown }>;
  boardWidth!: number;
  boardHeight!: number;
  topOffset!: number;
  leftOffset!: number;

  get current(): TwilightMap {
    return this.editHistory.current;
  }

  constructor(
    editHistory: EditHistory<TwilightMap>,
    editorState: EditorState,
    settings: Settings = DEFAULT_SETTINGS
  ) {
    this.editHistory = editHistory;
    this.editorState = editorState;
    this.tileWrappers = [];
    this.tileWidth = settings.tileWidth;
    this.tileHeight = settings.tileHeight;
    this.components = {
      tileControls: new TileControls(),
    };
  }

  _setBoardSize(): Result<void> {
    const r = this.current.rings;
    this.boardWidth = this.tileWidth * (1 + 1.5 * r);
    this.boardHeight = this.tileHeight * (1 + 2 * r);
    this.nodes.boardWrapper.style.width = `${this.boardWidth}px`;
    this.nodes.boardWrapper.style.height = `${this.boardHeight}px`;
    this.topOffset = 0.5 * this.boardHeight - 0.5 * this.tileHeight;
    this.leftOffset = 0.5 * this.boardWidth - 0.5 * this.tileWidth;
  }

  _drawBoard(): void {
    this._setBoardSize();

    this.current.board.forEach((t, i) => {
      if (i >= this.tileWrappers.length) this.addTileWrapper(i);
      this.drawTile(t, i);
    });
  }

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    <div class="tile-controls"></div>
    <div class="board-wrapper"></div>`;

    this.nodes = {
      tileControls: target.querySelector(".tile-controls") as HTMLElement,
      boardWrapper: target.querySelector(".board-wrapper") as HTMLElement,
    };

    this._drawBoard();
  }

  update(st: EditorState, indices: UpdateList): this {
    console.log("Updating tiles", indices);
    this.editorState = st;
    for (const i of indices) {
      if (typeof i === "number") {
        if (i < this.current.size) {
          if (i >= this.tileWrappers.length) this.addTileWrapper(i);
          this.drawTile(this.current.board[i], i);
        }
      }
      if (i === "tileControls") {
        // TODO
      }
    }
    return this;
  }

  drawTile(tile: number, index: number): void {
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
    div.classList.toggle("hidden", index >= this.current.size);

    img.src = `tiles/large/ST_${name}.png`;
    img.style.transform = `rotate(${r}deg)`;
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
    this.nodes.boardWrapper.appendChild(div);
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
