import {
  Maybe,
  Result,
  Tile,
  TileIndex,
  TileSelection,
  TileNameSet,
} from "../types";
import { EditHistory, Edit } from "../lib/chain";
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
  target: HTMLElement;
  initial?: TwilightMap;
}

interface Editor extends Settings {}

class Editor {
  boardView: BoardView;
  state: EditorState;
  editHistory: EditHistory<TwilightMap>;
  constructor(s: Settings) {
    this.target = s.target;
    (this.editHistory = this._initializeEditHistory(s.initial)),
      (this.state = {
        name: "idle",
        selection: [],
        dropTarget: [],
      });
    this.boardView = new BoardView(
      this._createBoard(),
      this.editHistory,
      this.state
    );
    this.boardView.draw();
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

  _createBoard(): HTMLElement {
    const boardDiv = document.createElement("div");
    boardDiv.id = "board-view";
    return this.target.appendChild(boardDiv);
  }

  _addEventListeners(): Result<void> {
    this.boardView.target.addEventListener("click", (ev) => {
      const index = getIndex(ev);
      if (index === null) return false;
      this.runState(transitions.clickTile(index));
      console.log(this.state);
      ev.stopPropagation();
    });

    this.boardView.target.addEventListener("dragstart", (ev) => {
      const index = getIndex(ev);
      if (index === null) return false;
      (ev.dataTransfer as DataTransfer).dropEffect = "move";
      this.runState(transitions.dragTile(index));
      ev.stopPropagation();
    });

    this.boardView.target.addEventListener("dragover", (ev) => {
      ev.preventDefault();
    });

    this.boardView.target.addEventListener("dragenter", (ev) => {
      ev.preventDefault();
      const index = getIndex(ev);
      if (index === null) return false;
      this.runState(transitions.dragEnterTile(index));
      ev.stopPropagation();
    });

    this.boardView.target.addEventListener("drop", (ev) => {
      const index = getIndex(ev);
      if (index === null) return false;
      ev.preventDefault();
      this.runState(transitions.dropOnTile(index));
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
    if (updated !== undefined) this.boardView.update(this.state, updated);
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
