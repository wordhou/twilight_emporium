import {
  Maybe,
  Result,
  Tile,
  TileIndex,
  TileSelection,
  TileNameSet,
} from "../types";
import { EditHistory, Edit } from "../lib/chain";
// import Component from "../lib/component";
import TwilightMap from "../lib/twilightmap";
import BoardView from "./boardview";
import Tiles from "../lib/tiles";
import data from "../data.json";
import {
  EditorState,
  EditorStateUpdate,
  transitions,
  Transition,
} from "./editorstate";

interface Settings {
  initial?: TwilightMap;
}

interface Editor extends Settings {}

class Editor {
  target?: HTMLElement;
  state: EditorState;
  editHistory: EditHistory<TwilightMap>;
  nodes!: Record<string, HTMLElement>;
  components!: {
    boardView: BoardView;
    [key: string]: {
      render: (t: HTMLElement) => unknown;
    };
  };

  constructor(s: Settings) {
    (this.editHistory = this._initializeEditHistory(s.initial)),
      (this.state = {
        name: "idle",
        selection: [],
        dropTarget: [],
      });
    this.components = {
      boardView: new BoardView(this.editHistory, this.state),
    };
  }

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    <div class="tile-selector"></div>
    <div class="board-view"></div>
    <div class="generator-pane"></div>`;
    this.nodes = {
      tileSelector: target.querySelector(".tile-selector") as HTMLElement,
      boardView: target.querySelector(".board-view") as HTMLElement,
      generatorPane: target.querySelector(".generator-pane") as HTMLElement,
    };

    for (const key in this.components) {
      this.components[key].render(this.nodes[key]);
    }

    this._addEventListeners();
  }

  get current(): TwilightMap {
    return this.editHistory.current;
  }

  get unusedTiles(): TileNameSet {
    const unusedTiles = new Set(Object.keys(data.tiles));
    for (const t of this.current.board) unusedTiles.delete(Tiles.getName(t));
    return unusedTiles;
  }

  _initializeEditHistory(init?: TwilightMap): EditHistory<TwilightMap> {
    const initState = init === undefined ? new TwilightMap(4) : init;
    return new EditHistory(initState);
  }

  _addEventListeners(): Result<void> {
    const board = this.components.boardView.nodes.boardWrapper;
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
      const index = getIndex(ev);
      if (index === null) return false;
      (ev.dataTransfer as DataTransfer).dropEffect = "move";
      this.runState(transitions.dragTile(index));
      ev.stopPropagation();
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

    (this.target as HTMLElement).addEventListener("rotateTile", (ev) => {
      if ((ev as CustomEvent).detail === "cw")
        this.runState(transitions.clickRotate(1));
      if ((ev as CustomEvent).detail === "ccw")
        this.runState(transitions.clickRotate(5));
      ev.stopPropagation();
    });

    document.addEventListener("dragend", (ev) => {
      ev.preventDefault();
      this.runState(transitions.dragEndDocument);
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
    if (updated !== undefined)
      this.components.boardView.update(this.state, updated);
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
