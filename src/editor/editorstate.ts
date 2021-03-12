import { Tile, TileIndex, TileName, TileSelection } from "../types";
import { Edit } from "../lib/chain";
import * as Edits from "./edits";
import * as util from "../lib/util";
import * as Hex from "../lib/hex";
import { BoardViewUpdate } from "./boardview";
import { TileSelectorUpdate } from "./tileselector";
import TIMapArray from "../lib/twilightmap";
import { IComponent } from "../lib/component";

const editorStateNames = ["idle", "selection", "dragging"] as const;
type StateNames = typeof editorStateNames[number];

interface EditorState {
  name: StateNames;
  selection: TileSelection;
  dropTarget: TileSelection;
  dragShape?: Hex.Hex[];
  tile?: Tile;
}

export interface EditorComponentUpdate {
  boardView?: BoardViewUpdate;
  tileSelector?: TileSelectorUpdate;
  [key: string]: unknown;
}

interface EditorStateUpdate extends EditorState {
  updated?: EditorComponentUpdate;
  edit?: Edit<TIMapArray>;
}

type Transition = (st: EditorState) => EditorStateUpdate | undefined;

const transitions = {
  clickTile: (i: TileIndex) => ({
    name,
    selection,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "idle")
      return {
        name: "selection",
        selection: [i],
        dropTarget: [],
        updated: { boardView: ["tileControls", i] },
      };
    if (name === "selection") {
      const unselect = selection.includes(i);
      return {
        name: selection.every((s) => s === i) ? "idle" : "selection",
        selection: unselect ? selection.filter((s) => s !== i) : [i], // Multi-select: selection.concat(i),
        dropTarget: [],
        updated: { boardView: ["tileControls", ...selection, i] },
      };
    }
  },
  dragBoardTile: (i: TileIndex) => ({
    name,
    selection,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "idle")
      return {
        name: "dragging",
        selection: [i],
        dropTarget: [i],
        dragShape: [[0, 0]],
        updated: { boardView: [i] },
      };
    if (name === "selection") {
      return selection.includes(i)
        ? {
            name: "dragging",
            selection,
            dropTarget: [i],
            dragShape: [[0, 0]],
            updated: { boardView: ["tileControls", i] },
          }
        : { name, selection, dropTarget: [] };
    }
  },
  dragUnusedTile: (tile: Tile) => ({
    name,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "idle")
      return {
        name: "dragging",
        selection: [],
        tile,
        dropTarget: [],
        dragShape: [[0, 0]],
      };
  },
  dragEnterTile: (i: TileIndex) => ({
    name,
    selection,
    tile,
    dropTarget,
    dragShape,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "dragging") {
      const newDropTarget = Hex.addDragShape(dragShape as Hex.Hex[], i);
      return {
        name: "dragging",
        selection,
        tile,
        dropTarget: newDropTarget,
        dragShape,
        updated: { boardView: [...dropTarget, ...newDropTarget] },
      };
    }
  },
  dropOnTile: (i: TileIndex) => ({
    name,
    selection,
    tile,
    dropTarget,
    dragShape,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "dragging") {
      const newDropTarget = Hex.addDragShape(dragShape as Hex.Hex[], i); // Should be the same as dropTarget but, recalculate anyway
      if (selection.length > 0)
        return {
          name: "idle",
          selection: [],
          dropTarget: [],
          updated: {
            boardView: ["tileControls", ...selection, ...newDropTarget],
          },
          edit: new Edits.SwapManyTiles(util.zip(selection, dropTarget)),
        };
      if (tile !== undefined)
        return {
          name: "idle",
          selection: [],
          dropTarget: [],
          updated: {
            tileSelector: { all: true },
            boardView: ["tileControls", ...dropTarget, ...newDropTarget],
          },
          edit: new Edits.SetTile(tile, newDropTarget[0]),
        };
    }
  },
  dragEndDocument: ({
    name,
    selection,
    dropTarget,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "dragging") {
      return {
        name: "idle",
        selection: [],
        dropTarget: [],
        updated: { boardView: ["tileControls", ...selection, ...dropTarget] },
      };
    }
  },
  clickElsewhere: ({
    name,
    selection,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "selection") {
      return {
        name: "idle",
        selection: [],
        dropTarget: [],
        updated: { boardView: ["tileControls", ...selection] },
      };
    }
  },
  clickRotate: (r: number) => ({
    name,
    selection,
    dropTarget,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "selection" && selection.length === 1)
      return {
        name,
        selection,
        dropTarget,
        edit: new Edits.RotateTile(selection[0], r),
        updated: { boardView: selection },
      };
  },
  clickResetTiles: ({
    name,
    selection,
    dropTarget,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "selection") {
      return {
        name,
        selection,
        dropTarget,
        edit: new Edits.ResetTiles(selection),
        updated: { boardView: [...selection] }, //TODO
      };
    }
  },
};

export { EditorState, EditorStateUpdate, transitions, Transition };
