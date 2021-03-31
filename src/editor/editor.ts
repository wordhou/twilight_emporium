import { Maybe, Result, TileIndex } from "../types";
import { EditHistory } from "../lib/chain";
import TIMapArray from "../lib/twilightmap";
import BoardView from "./boardview";
import Tiles from "../lib/tiles";
import Component from "../lib/component";
import Api from "./api";
import { IComponent } from "../lib/component";
import {
  EditorComponentUpdate,
  EditorState,
  EditorStateUpdate,
} from "./editorstate";
import StateTransitions from "./editorstate";
import TileSelector from "./tileselector";
import EditorControls from "./editorcontrols";
import "./editor.css";
import { MapData } from "../app/models/map";
import { UserData } from "../app/models/user";
import { Resize } from "./edits";

interface Settings {
  initial?: TIMapArray;
  mapData?: MapData;
  userData?: UserData;
}

const DEFAULT_SETTINGS = {
  mapData: {
    map_name: "New Twilight Imperium map",
    description: "Map description",
    versions: [],
  },
};

class Editor {
  target!: HTMLElement;
  state: EditorState; // UI state of the editor
  editHistory: EditHistory<TIMapArray>; // map state
  nodes!: Record<string, HTMLElement>;
  transitions: StateTransitions;
  mapData: Partial<MapData>;
  userData?: UserData;
  api: Api;
  components!: {
    boardView: BoardView;
    tileSelector: TileSelector;
    //generatorPane: Component;
    [key: string]: IComponent;
  };

  constructor(s: Settings) {
    console.log(s.initial);
    this.editHistory = this._initializeEditHistory(s.initial);
    this.mapData = s.mapData || DEFAULT_SETTINGS.mapData;
    this.userData = s.userData;
    this.transitions = new StateTransitions();
    this.api = new Api(this);
    this.state = {
      name: "idle",
      selection: [],
      dropTarget: [],
    };
    this.components = {
      editorControls: new EditorControls(this),
      tileSelector: new TileSelector(this),
      boardView: new BoardView(this),
      //generatorPane: new Component(),
    };
  }

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    <div class="editorControls"></div>
    <div class="editor-main">
      <div class="boardView"></div>
      <div class="editor-main-sidebar">
        <div class="tileSelector"></div>
      </div>
      </div>
    </div>
    `;

    this.nodes = Component.attachComponentsToNodes(this.components, target);
    this._addEventListeners();
  }

  update(updated: EditorComponentUpdate): void {
    for (const comp in updated) {
      const component = this.components[comp];
      if (component.update !== undefined) component.update(updated[comp]);
    }
  }

  get current(): TIMapArray {
    return this.editHistory.current;
  }

  _initializeEditHistory(init?: TIMapArray): EditHistory<TIMapArray> {
    const initState = init === undefined ? new TIMapArray(3) : init;
    return new EditHistory(initState);
  }

  _addEventListeners(): Result<void> {
    const board = this.components.boardView.nodes.boardWrapper;
    const unusedTiles = this.components.tileSelector.nodes.tilesWrapper;
    board.addEventListener("click", (ev) => {
      const index = getIndex(ev);
      if (index === null) {
        this.runState(this.transitions.clickElsewhere);
        return;
      }
      this.runState(this.transitions.clickTile(index));
      ev.stopPropagation();
    });

    board.addEventListener("dragstart", (ev) => {
      const el = ev.target;
      if (
        !(el instanceof HTMLElement) ||
        !el.classList.contains("tile-wrapper")
      )
        return null;
      ev.stopPropagation();
      const index = parseInt(el.dataset.i as string) as number;
      this.runState(this.transitions.dragBoardTile(index));
      (ev.dataTransfer as DataTransfer).dropEffect = "move";
    });

    unusedTiles.addEventListener("dragstart", (ev) => {
      const el = ev.target;
      if (!(el instanceof HTMLElement) || !el.classList.contains("unused-tile"))
        return null;
      ev.stopPropagation();
      const name = el.dataset.name as string;
      const tile = Tiles.fromTTSString(name) as number;
      this.runState(this.transitions.dragUnusedTile(tile));
      (ev.dataTransfer as DataTransfer).dropEffect = "move";
    });

    board.addEventListener("dragover", (ev) => {
      ev.preventDefault();
    });

    board.addEventListener("dragenter", (ev) => {
      ev.preventDefault();
      const index = getIndex(ev);
      if (index === null) return false;
      this.runState(this.transitions.dragEnterTile(index));
      ev.stopPropagation();
    });

    board.addEventListener("drop", (ev) => {
      const index = getIndex(ev);
      if (index === null) return false;
      ev.preventDefault();
      this.runState(this.transitions.dropOnTile(index));
    });

    this.target.addEventListener("dragend", (ev) => {
      ev.preventDefault();
      this.runState(this.transitions.dragEndDocument);
    });

    this.target.addEventListener("rotateTile", (ev) => {
      if (!(ev instanceof CustomEvent)) return;
      if (ev.detail === "cw") this.runState(this.transitions.clickRotate(1));
      if (ev.detail === "ccw") this.runState(this.transitions.clickRotate(5));
      ev.stopPropagation();
    });

    this.target.addEventListener("resetRotation", (ev) => {
      this.runState(this.transitions.clickResetTiles);
      ev.stopPropagation();
    });

    this.target.addEventListener("undoEdit", (ev) => {
      if (this.editHistory.onBottom()) return;
      this.editHistory.undo();
      this.state = { name: "idle", dropTarget: [], selection: [] };
      this.update({
        tileSelector: { all: true },
        boardView: ["tileControls", "allIndices", "mapSize"],
        editorControls: true,
      });
      ev.stopPropagation();
    });

    this.target.addEventListener("redoEdit", (ev) => {
      if (this.editHistory.onTop()) return;
      this.state = { name: "idle", dropTarget: [], selection: [] };
      ev.stopPropagation();
      const tiles = this.editHistory.redo();
      if (tiles instanceof Error) return false;
      this.update({
        tileSelector: { all: true },
        boardView: ["tileControls", "allIndices", "mapSize"],
        editorControls: true,
      });
    });

    this.target.addEventListener("addRing", (ev) => {
      this.state = { name: "idle", dropTarget: [], selection: [] };
      ev.stopPropagation();
      this.editHistory.add(new Resize(1));
      this.update({
        boardView: ["tileControls", "mapSize"],
        editorControls: true,
      });
    });

    this.target.addEventListener("removeRing", (ev) => {
      this.state = { name: "idle", dropTarget: [], selection: [] };
      ev.stopPropagation();
      this.editHistory.add(new Resize(-1));
      this.update({
        boardView: ["tileControls", "mapSize"],
        editorControls: true,
      });
    });

    this.target.addEventListener("saveMap", (ev) => {
      ev.stopPropagation();
      if (this.api.canSave()) this.runState(this.transitions.save(this.api));
    });
  }

  runState(
    transition: (st: EditorState) => EditorStateUpdate | undefined
  ): Result<void> {
    const stateUpdate = transition(this.state);
    if (stateUpdate === undefined) return new Error("Invalid transition");
    const { edit, updated } = stateUpdate;
    this.state = stateUpdate;
    if (edit !== undefined) this.editHistory.add(edit);
    if (updated !== undefined) this.update(updated);
  }
}

function getIndex(ev: Event): Maybe<TileIndex> {
  if (ev.target === null || !(ev.target instanceof HTMLElement)) return null;
  const el = ev.target;
  if (!el.classList.contains("tile-wrapper") || el.dataset.i === undefined)
    return null;
  return parseInt(el.dataset.i);
}

export default Editor;
