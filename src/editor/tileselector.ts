import "./tileselector.css";
import Editor from "./editor";
import Component from "../lib/component";
import BoardView from "./boardview";
import { Tile, TileInfo, TileName, TileNameSet, TileType } from "../types";
import Tiles from "../lib/tiles";
import data from "../data.json";

const filters = {
  showPok: (ti: TileInfo) => !!ti.pok,
  showHomeTiles: (ti: TileInfo) => ti.type === "green",
  showHyperlanes: (ti: TileInfo) => !!ti.hyperlanes,
  showAnomalies: (ti: TileInfo) => !!ti.anomaly,
  showUnplayable: (ti: TileInfo) => !!ti.unplayable,
  showPlanetTiles: (ti: TileInfo) =>
    ti.type === "blue" && ti.planets.length > 0 && !ti.anomaly,
  showEmpty: (ti: TileInfo) =>
    (ti.type === "blue" || ti.type === "red") &&
    !ti.anomaly &&
    !ti.hyperlanes &&
    ti.planets.length === 0,
} as const;

const tiles = data.tiles;

type TileFilter = keyof typeof filters;

type Filters = Record<TileFilter, boolean>;

export type TileSelectorUpdate = {
  dropTarget?: Iterable<number>;
  tile?: Tile;
  tileName?: TileName;
  filter?: TileFilter;
  all?: boolean;
};

const DEFAULT_SETTINGS: Filters = {
  showPok: true,
  showHomeTiles: true,
  showAnomalies: true,
  showUnplayable: false,
  showEmpty: false,
  showHyperlanes: false,
  showPlanetTiles: true,
};

export default class TileSelector {
  nodes!: Record<string, HTMLElement>;
  components!: Record<string, Component>;
  target!: HTMLElement;
  editor: Editor;
  filters: Filters;
  unusedTiles: Set<string>;
  tileNames = Object.keys(tiles);
  tiles: Record<string, HTMLElement>;

  constructor(editor: Editor) {
    this.editor = editor;
    this.unusedTiles = new Set(Object.keys(tiles));
    for (const t of this.editor.current.board)
      this.unusedTiles.delete(Tiles.getName(t));
    this.tiles = {};
    this.filters = { ...DEFAULT_SETTINGS };
    this.components = {
      tileSelectorSettings: new TileSelectorSettings(this.filters),
    };
  }

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    <header>
    <h2>Unused tiles</h2>
    </header>
    <section class="tileSelectorSettings"></section>
      <div class="tilesWrapper"></div>
    `;
    this.nodes = Component.getNodesByClass(
      ["tilesWrapper", "tileSelectorSettings"],
      target
    );

    this.components.tileSelectorSettings.render(
      this.nodes.tileSelectorSettings
    );
    this._makeTiles();
    this._addEventListeners();
    this._style();
  }

  update({
    all,
    tile,
    tileName,
    dropTarget,
    filter,
  }: TileSelectorUpdate): void {
    if (all) {
      for (const name in this.tiles) this._updateTile(name as TileName);
      return;
    }
    if (tile !== undefined) this._updateTile(Tiles.getName(tile) as TileName);
    if (tileName !== undefined) this._updateTile(tileName);
    if (dropTarget !== undefined) {
      const board = this.editor.current.board;
      for (const index of dropTarget) {
        this._updateTile(Tiles.getName(board[index]) as TileName);
      }
    }
    if (filter !== undefined && filter in filters)
      Object.entries(tiles)
        .filter(([_, v]) => filters[filter](v as TileInfo))
        .forEach(([name, _]) => this._updateTile(name as TileName));
  }

  _makeTiles(): void {
    const tilesWrapper = this.nodes.tilesWrapper;
    for (const tileName in tiles) {
      const tile = this._makeTile(tileName);
      tilesWrapper.appendChild(tile);
      this.tiles[tileName] = tile;
      this._updateTile(tileName as TileName);
    }
  }

  _makeTile(name: string): HTMLElement {
    const div = document.createElement("div");
    const flippable = /\d+(A|B)/.test(name);
    div.dataset.name = name;
    div.setAttribute("draggable", "true");
    div.classList.add("unused-tile");
    div.innerHTML = `
    <img src="tiles/large/ST_${name}.png" />
    `;
    return div;
  }

  _updateTile(name: TileName): void {
    const board = this.editor.current.board; // Uses current board state
    const style = this.tiles[name].style;
    const tileInfo = tiles[name] as TileInfo;
    for (const fn in filters) {
      if (
        !this.filters[fn as TileFilter] &&
        filters[fn as TileFilter](tileInfo)
      ) {
        style.display = "none";
        return;
      }
    }
    const re = /(\d+)(A|B)?/.exec(name);
    if (re === null) throw new Error(`Invalid tile name ${name}`);
    const tileNum = parseInt(re[1]);
    if (name !== "0" && board.some((t) => Tiles.getNumber(t) === tileNum)) {
      style.display = "none";
      return;
    }
    style.display = "block";
  }

  _style(): void {
    //TODO
  }

  _addEventListeners(): void {
    this.target.addEventListener("filterUpdate", (ev) => {
      ev.stopPropagation();
      const filterName = (ev as CustomEvent).detail as TileFilter;
      this.update({ filter: filterName });
      ev.stopPropagation();
    });
  }
}

const cbButton = (
  bootstrapIcon: string,
  alt: string,
  cb: (e?: Event) => void
) => {
  return {
    render: (el: HTMLElement) => {
      el.classList.add("flip-button");
      el.innerHTML = `<a><i class="${bootstrapIcon}"></i>${alt}</a>`;
      el.addEventListener("click", cb);
    },
  };
};

const eventEmitter = (
  bootstrapIcon: string,
  alt: string,
  eventName: string,
  detail?: unknown
) => {
  return {
    render: (el: HTMLElement) => {
      el.classList.add("tile-selector-button");
      el.innerHTML = `<a><i class="${bootstrapIcon}"></i>${alt}</a>`;
      el.addEventListener("click", (ev) => {
        const customEvent = new CustomEvent(eventName, {
          bubbles: true,
          detail,
        });
        el.dispatchEvent(customEvent);
        ev.stopPropagation();
      });
    },
  };
};

class TileSelectorSettings extends Component {
  target!: HTMLElement;
  filters: Filters; // Reference to parent object
  nodes!: Record<string, HTMLElement>;

  constructor(s: Filters) {
    super();
    this.filters = s;
    this.nodes = {};
  }

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    <ul class="tile-selector-options">
      <li class="tile-selector-option">
        <input type="checkbox" id="showPok">
        <label for="showPok">Show tiles from Prophecy of Kings</label>
      </li>
      <li class="tile-selector-option">
        <input type="checkbox" id="showPlanetTiles">
        <label for="showPlanetTiles">Show ordinary planet tiles</label>
      </li>
      <li class="tile-selector-option">
        <input type="checkbox" id="showHomeTiles">
        <label for="showHomeTiles">Show home tiles for individual factions</label>
      </li>
      <li class="tile-selector-option">
        <input type="checkbox" id="showHyperlanes">
        <label for="showHyperlanes">Show hyperlane tiles</label>
      </li>
      <li class="tile-selector-option">
        <input type="checkbox" id="showAnomalies">
        <label for="showAnomalies">Show anomaly tiles</label>
      </li>
      <li class="tile-selector-option">
        <input type="checkbox" id="showUnplayable">
        <label for="showUnplayable">Show unplayable tiles (tiles with irregular borders)</label>
      </li>
      <li class="tile-selector-option">
        <input type="checkbox" id="showEmpty">
        <label for="showEmpty">Show empty tiles</label>
      </li>
    </ul>
    `;
    for (const name in filters) {
      const node = target.querySelector(`#${name}`) as HTMLInputElement;
      if (node === null) throw Error(`No element with id ${name}`);
      this.nodes[name] = node;
      node.checked = this.filters[name as TileFilter];
      node.addEventListener("click", (ev) => {
        this.filters[name as TileFilter] = node.checked;
        node.dispatchEvent(
          new CustomEvent("filterUpdate", { bubbles: true, detail: name })
        );
        ev.stopPropagation();
      });
    }
  }
}
