import { TileIndex, TileSelection } from "../types";
import { Edit } from "../lib/chain";
import * as Edits from "./edits";
import * as util from "../lib/util";
import * as Hex from "../lib/hex";
import TwilightMap from "../lib/twilightmap";

const editorStateNames = ["idle", "selection", "dragging"] as const;
type StateNames = typeof editorStateNames[number];

interface EditorState {
  name: StateNames;
  selection: TileSelection;
  dropTarget: TileSelection;
  dragShape?: Hex.Hex[];
}

interface EditorStateUpdate extends EditorState {
  updated?: TileSelection;
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
        updated: [i],
      };
    if (name === "selection") {
      const unselect = selection.includes(i);
      return {
        name: selection.every((s) => s === i) ? "idle" : "selection",
        selection: unselect ? selection.filter((s) => s !== i) : [i], // Multi-select: selection.concat(i),
        dropTarget: [],
        updated: selection.concat([i]),
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
        updated: [i],
      };
    if (name === "selection") {
      return selection.includes(i)
        ? {
            name: "dragging",
            selection,
            dropTarget: [i],
            dragShape: [[0, 0]],
            updated: [i],
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
        updated: dropTarget.concat(newDropTarget),
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
        updated: dropTarget.concat(selection, newDropTarget),
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
        updated: selection.concat(dropTarget),
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
        updated: selection,
      };
    }
  },
};

export { EditorState, EditorStateUpdate, transitions, Transition };
