import { TileIndex, TileSelection } from "../types";
import { Edit } from "../lib/chain";
import * as Edits from "./edits";
import * as util from "../lib/util";
import * as Hex from "../lib/hex";
import { UpdatableElem, BoardViewUpdate } from "./boardview";
import TwilightMap from "../lib/twilightmap";
import { IComponent } from "../lib/component";

const editorStateNames = ["idle", "selection", "dragging"] as const;
type StateNames = typeof editorStateNames[number];

interface EditorState {
  name: StateNames;
  selection: TileSelection;
  dropTarget: TileSelection;
  dragShape?: Hex.Hex[];
}

interface EditorStateUpdate extends EditorState {
  updated?: {
    boardView?: BoardViewUpdate;
    [key: string]: unknown;
  };
  edit?: Edit<TwilightMap>;
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
  dragTile: (i: TileIndex) => ({
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
  dragEnterTile: (i: TileIndex) => ({
    name,
    selection,
    dropTarget,
    dragShape,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "dragging") {
      const newDropTarget = Hex.addDragShape(dragShape as Hex.Hex[], i);
      return {
        name: "dragging",
        selection,
        dropTarget: newDropTarget,
        dragShape,
        updated: { boardView: [...dropTarget, ...newDropTarget] },
      };
    }
  },
  dropOnTile: (i: TileIndex) => ({
    name,
    selection,
    dropTarget,
    dragShape,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "dragging") {
      const newDropTarget = Hex.addDragShape(dragShape as Hex.Hex[], i); // Should be the same as dropTarget but, recalculate anyway
      return {
        name: "idle",
        selection: [],
        dropTarget: [],
        updated: {
          boardView: ["tileControls", ...selection, ...newDropTarget],
        },
        edit: new Edits.SwapManyTiles(util.zip(selection, dropTarget)),
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
  clickResetRotation: () => ({
    name,
    selection,
    dropTarget,
  }: EditorState): EditorStateUpdate | undefined => {
    if (name === "selection") {
      return {
        name,
        selection,
        dropTarget,
        edit: undefined, // TODO
        updated: undefined, //TODO
      };
    }
  },
};

export { EditorState, EditorStateUpdate, transitions, Transition };
