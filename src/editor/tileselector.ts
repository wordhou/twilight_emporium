import "./tileselector.css";
import Editor from "./editor";

export default class TileSelector {
  target?: HTMLElement;
  editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  render(target: HTMLElement): void {
    this.target = target;
  }
}
