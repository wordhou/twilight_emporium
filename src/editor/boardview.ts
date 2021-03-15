import { Result, Tile, TileIndex } from "../types";
import { EditHistory } from "../lib/chain";
import TIMapArray from "../lib/twilightmap";
import * as Hex from "../lib/hex";
import Tiles from "../lib/tiles";
import { EditorState } from "./editorstate";
import Editor from "./editor";
import TileControls from "./tilecontrols";
import Component from "../lib/component";
import "./boardview.css";
import BoardControls from "./boardcontrols";

type TileSelection = Iterable<number>;
export type UpdatableElem =
  | "tileControls"
  | "allIndices"
  | "mapSize"
  | "tileSize";
export type BoardViewUpdate = Array<number | UpdatableElem>;

interface Settings {
  sizeFactor: number;
  tileHeight: number;
  tileWidth: number;
  tileNumberOverlay: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  sizeFactor: 0.64,
  tileWidth: 364,
  tileHeight: 317,
  tileNumberOverlay: false,
};

interface BoardView extends Settings {}

class BoardView extends Component {
  target!: HTMLElement;
  tileWrappers: HTMLElement[];
  editor: Editor;
  nodes!: Record<string, HTMLElement>;
  components!: {
    tileControls: TileControls;
    boardControls: BoardControls;
  };
  boardWidth!: number;
  boardHeight!: number;
  topOffset!: number;
  leftOffset!: number;

  get current(): TIMapArray {
    return this.editHistory.current;
  }

  get editHistory(): EditHistory<TIMapArray> {
    return this.editor.editHistory;
  }

  get editorState(): EditorState {
    return this.editor.state;
  }

  constructor(editor: Editor, settings: Settings = DEFAULT_SETTINGS) {
    super();
    this.editor = editor;
    this.tileWrappers = [];
    this.tileWidth = settings.tileWidth || DEFAULT_SETTINGS.tileWidth;
    this.tileHeight = settings.tileHeight || DEFAULT_SETTINGS.tileHeight;
    this.sizeFactor = settings.sizeFactor || DEFAULT_SETTINGS.sizeFactor;
    this.tileNumberOverlay =
      settings.tileNumberOverlay || DEFAULT_SETTINGS.tileNumberOverlay;
    this.components = {
      tileControls: new TileControls(this),
      boardControls: new BoardControls(this),
    };
  }

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    <div class="boardControls"></div>
    <div class="boardWrapper">
      <div class="tileControls"></div>
    </div>
    `;

    this.nodes = Component.attachComponentsToNodes(this.components, target);

    this.nodes.boardWrapper = target.querySelector(
      ".boardWrapper"
    ) as HTMLElement;
    this._drawBoard();
    this._addEventListeners();
  }

  update(updates: BoardViewUpdate): void {
    console.log("Updating boardView", updates);
    if (updates.includes("mapSize")) {
      const newLen = this.current.board.length;
      const curLen = this.tileWrappers.length;
      if (curLen < newLen) {
        console.log("curLen:", curLen, "newLen: ", newLen);
        for (let i = curLen; i < newLen; i++) this._addTileWrapper(i);
      }
      if (curLen > newLen) {
        console.log("curLen:", curLen, "newLen: ", newLen);
        for (let i = newLen; i < curLen; i++) this.tileWrappers[i].remove();
        this.tileWrappers = this.tileWrappers.slice(0, newLen);
      }
    }
    for (const i of updates) {
      if (typeof i === "number") {
        if (i < this.current.size) {
          if (i >= this.tileWrappers.length) this._addTileWrapper(i);
          this._drawTile(this.current.board[i], i);
        }
      }
    }
    if (updates.includes("tileControls")) this.components.tileControls.update();
    if (updates.includes("allIndices"))
      this.current.board.forEach((t, i) => this._drawTile(t, i));
    if (updates.includes("tileSize") || updates.includes("mapSize")) {
      this._setBoardSizes();
      this._style();
      this.tileWrappers.forEach((_, i) => {
        this._drawTile(this.current.board[i], i);
        this._styleTileWrapper(i);
      });
    }
  }

  _addEventListeners(): void {
    this.target.addEventListener("toggleNumbers", (ev) => {
      this.tileNumberOverlay = !this.tileNumberOverlay;
      this._style();
      ev.stopPropagation();
    });
    this.target.addEventListener("zoomIn", (ev) => {
      this.sizeFactor *= 1.25;
      this.update(["tileSize"]);
      ev.stopPropagation();
    });
    this.target.addEventListener("zoomOut", (ev) => {
      this.sizeFactor *= 0.8;
      this.update(["tileSize"]);
      ev.stopPropagation();
    });
  }

  _drawBoard(): void {
    this._setBoardSizes();
    this._style();

    this.current.board.forEach((t, i) => {
      if (i >= this.tileWrappers.length) this._addTileWrapper(i);
      this._drawTile(t, i);
    });
  }

  _setBoardSizes(): void {
    const r = this.current.rings;
    const [sf, tw, th] = [this.sizeFactor, this.tileWidth, this.tileHeight];
    this.boardWidth = sf * tw * (1 + 1.5 * r);
    this.boardHeight = sf * th * (1 + 2 * r);
    this.topOffset = 0.5 * this.boardHeight - 0.5 * sf * th;
    this.leftOffset = 0.5 * this.boardWidth - 0.5 * sf * tw;
  }

  _style(): Result<void> {
    const bw = this.nodes.boardWrapper;
    bw.style.width = `${this.boardWidth}px`;
    bw.style.height = `${this.boardHeight}px`;
    bw.classList.toggle("tile-numbers", this.tileNumberOverlay);
  }

  _drawTile(tile: number, index: number): void {
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

  _addTileWrapper(index: number): Result<HTMLElement> {
    const div = document.createElement("div");
    div.innerHTML = `<div class="number-overlay">${index}</div>
    `;
    div.classList.add("tile-wrapper");
    div.setAttribute("draggable", "true");
    div.dataset.i = `${index}`;
    this.nodes.boardWrapper.appendChild(div);
    this.tileWrappers[index] = div;
    this._styleTileWrapper(index);
    return div;
  }

  _styleTileWrapper(index: number): Result<void> {
    if (index > this.tileWrappers.length)
      return new Error(`Index out of range for tileWrappers`);
    const div = this.tileWrappers[index];
    const [sf, tw, th, to, lo] = [
      this.sizeFactor,
      this.tileWidth,
      this.tileHeight,
      this.topOffset,
      this.leftOffset,
    ];
    const [x, y] = Hex.spiralToXY(index, sf * tw, sf * th);
    div.style.width = `${sf * tw}px`;
    div.style.height = `${sf * th}px`;
    div.style.top = `${to - y}px`;
    div.style.left = `${lo + x}px`;
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
