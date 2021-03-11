import "./editorcontrols.css";
import Component from "../lib/component";
import Editor from "./editor";

export default class EditorControls extends Component {
  editor: Editor;
  nodes!: Record<string, HTMLElement>;
  components!: Record<string, Component>;
  target!: HTMLElement;

  constructor(editor: Editor) {
    super();
    this.editor = editor;
    this.components = {
      mapInfo: this.info(),
      undoEdit: this.button("", "Undo", "undoEdit"),
      redoEdit: this.button("", "Redo", "redoEdit"),
      saveMap: this.button("", "Save", "saveMap"),
      newMap: this.button("", "New", "newMap"),
    };
  }

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    <div class="mapInfo"></div>
    <nav class="editor-controls-wrapper">
      <div class="undoEdit"></div>
      <div class="redoEdit"></div>
      <div class="saveMap"></div>
      <div class="newMap"></div>
    </nav>
    `;
    this.nodes = Component.attachComponentsToNodes(
      this.components,
      this.target
    );
    this.style();
  }

  style(): void {
    this.nodes.undoEdit.classList.toggle("inactive", false /*TODO*/);
    this.nodes.redoEdit.classList.toggle("inactive", false /*TODO*/);
  }

  button(
    bootstrapIcon: string,
    text: string,
    eventName: string,
    detail?: unknown
  ): Component {
    return {
      render: (el: HTMLElement) => {
        el.classList.add("editor-controls-button");
        el.innerHTML = `<a><i class="${bootstrapIcon}"></i>${text}</a>`;
        el.addEventListener("click", () => {
          const customEvent = new CustomEvent(eventName, {
            bubbles: true,
            detail,
          });
          el.dispatchEvent(customEvent);
        });
      },
    };
  }

  info(): Component {
    return {
      render: (t: HTMLElement) => {
        t.innerHTML = `
        <h1>file name</h1>: ${"helloworld"}`;
      },
    };
  }
}
