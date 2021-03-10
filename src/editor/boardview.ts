import { Result, Tile, TileIndex } from "../types";
import { EditHistory } from "../lib/chain";
import TwilightMap from "../lib/twilightmap";
import * as Hex from "../lib/hex";
import Tiles from "../lib/tiles";
import { EditorState } from "./editorstate";
import Editor from "./editor";
import TileControls from "./tilecontrols";
import BoardControls from "./boardcontrols";
import Component from "../lib/component";
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

class BoardView extends Component {
  target!: HTMLElement;
  tileWrappers: HTMLElement[];
  editor: Editor;
  nodes!: Record<string, HTMLElement>;
  components!: {
    boardControls: BoardControls;
    tileControls: TileControls;
  };
  boardWidth!: number;
  boardHeight!: number;
  topOffset!: number;
  leftOffset!: number;

  get current(): TwilightMap {
    return this.editHistory.current;
  }

  get editHistory(): EditHistory<TwilightMap> {
    return this.editor.editHistory;
  }

  get editorState(): EditorState {
    return this.editor.state;
  }

  constructor(editor: Editor, settings: Settings = DEFAULT_SETTINGS) {
    super();
    this.editor = editor;
    this.tileWrappers = [];
    this.tileWidth = settings.tileWidth;
    this.tileHeight = settings.tileHeight;
    this.components = {
      tileControls: new TileControls(this),
      boardControls: new BoardControls(),
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

    this.nodes = Component.getNodesFromElement(
      ["tileControls", "boardWrapper", "boardControls"],
      target
    );

    this.components.tileControls.render(this.nodes.tileControls);
    this.components.boardControls.render(this.nodes.boardControls);
    this._drawBoard();
  }

  update(indices: UpdateList): this {
    console.log("Updating tiles", indices);
    for (const i of indices) {
      if (typeof i === "number") {
        if (i < this.current.size) {
          if (i >= this.tileWrappers.length) this._addTileWrapper(i);
          this._drawTile(this.current.board[i], i);
        }
      }
      if (i === "tileControls") {
        // TODO
      }
    }
    this.components.tileControls.update();
    return this;
  }

  _drawBoard(): void {
    this._setBoardSize();

    this.current.board.forEach((t, i) => {
      if (i >= this.tileWrappers.length) this._addTileWrapper(i);
      this._drawTile(t, i);
    });
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
