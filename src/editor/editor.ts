import { Maybe, Result, TileIndex, TileNameSet } from "../types";
import { EditHistory } from "../lib/chain";
import TIMapArray from "../lib/twilightmap";
import BoardView from "./boardview";
import Tiles from "../lib/tiles";
import data from "../data.json";
import Component from "../lib/component";
import { IComponent } from "../lib/component";
import {
  EditorComponentUpdate,
  EditorState,
  EditorStateUpdate,
  transitions,
} from "./editorstate";
import TileSelector from "./tileselector";
import EditorControls from "./editorcontrols";
import "./editor.css";

interface Settings {
  initial?: TIMapArray;
}

interface Editor extends Settings {}

class Editor {
  target!: HTMLElement;
  state: EditorState; // UI state of the editor
  editHistory: EditHistory<TIMapArray>; // map state
  nodes!: Record<string, HTMLElement>;
  components!: {
    boardView: BoardView;
    tileSelector: TileSelector;
    //generatorPane: Component;
    [key: string]: IComponent;
  };

  constructor(s: Settings) {
    (this.editHistory = this._initializeEditHistory(s.initial)),
      (this.state = {
        name: "idle",
        selection: [],
        dropTarget: [],
      });
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
        <div class="generatorPane"></div>
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
    const initState = init === undefined ? new TIMapArray(4) : init;
    return new EditHistory(initState);
  }

  _addEventListeners(): Result<void> {
    const board = this.components.boardView.nodes.boardWrapper;
    const unusedTiles = this.components.tileSelector.nodes.tilesWrapper;
    board.addEventListener("click", (ev) => {
      const index = getIndex(ev);
      if (index === null) {
        this.runState(transitions.clickElsewhere);
        return;
      }
      this.runState(transitions.clickTile(index));
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
      this.runState(transitions.dragBoardTile(index));
      (ev.dataTransfer as DataTransfer).dropEffect = "move";
    });

    unusedTiles.addEventListener("dragstart", (ev) => {
      const el = ev.target;
      console.log(el);
      if (!(el instanceof HTMLElement) || !el.classList.contains("unused-tile"))
        return null;
      ev.stopPropagation();
      const name = el.dataset.name as string;
      const tile = Tiles.fromTTSString(name) as number;
      this.runState(transitions.dragUnusedTile(tile));
      (ev.dataTransfer as DataTransfer).dropEffect = "move";
    });

    board.addEventListener("dragover", (ev) => {
      ev.preventDefault();
    });

    board.addEventListener("dragenter", (ev) => {
      ev.preventDefault();
      const index = getIndex(ev);
      if (index === null) return false;
      this.runState(transitions.dragEnterTile(index));
      ev.stopPropagation();
    });

    board.addEventListener("drop", (ev) => {
      const index = getIndex(ev);
      if (index === null) return false;
      ev.preventDefault();
      this.runState(transitions.dropOnTile(index));
    });

    this.target.addEventListener("dragend", (ev) => {
      ev.preventDefault();
      this.runState(transitions.dragEndDocument);
    });

    this.target.addEventListener("rotateTile", (ev) => {
      if (!(ev instanceof CustomEvent)) return;
      if (ev.detail === "cw") this.runState(transitions.clickRotate(1));
      if (ev.detail === "ccw") this.runState(transitions.clickRotate(5));
      ev.stopPropagation();
    });

    this.target.addEventListener("resetRotation", (ev) => {
      this.runState(transitions.clickResetTiles);
      ev.stopPropagation();
    });

    this.target.addEventListener("undoEdit", (ev) => {
      this.editHistory.undo();
      this.state = { name: "idle", dropTarget: [], selection: [] };
      this.update({
        tileSelector: { all: true },
        boardView: ["tileControls", "allIndices"],
      });
      ev.stopPropagation();
    });

    this.target.addEventListener("redoEdit", (ev) => {
      this.state = { name: "idle", dropTarget: [], selection: [] };
      ev.stopPropagation();
      const tiles = this.editHistory.redo();
      if (tiles instanceof Error) return false;
      this.update({
        tileSelector: { all: true },
        boardView: ["tileControls", "allIndices"],
      });
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
