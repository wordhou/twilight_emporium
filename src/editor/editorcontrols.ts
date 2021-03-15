import "./editorcontrols.css";
import Component from "../lib/component";
import Editor from "./editor";

export default class EditorControls extends Component {
  editor: Editor;
  nodes!: Record<string, HTMLElement>;
  components!: Record<string, Component>;
  target!: HTMLElement;
  saved: boolean;

  constructor(editor: Editor) {
    super();
    this.editor = editor;
    this.saved = false;
    this.components = {
      mapInfo: this.info(),
      undoEdit: this.button("bi-caret-left-fill", "Undo", "undoEdit"),
      redoEdit: this.button("bi-caret-right-fill", "Redo", "redoEdit"),
      saveMap: this.button("bi-save2-fill", "Save", "saveMap"),
      //newMap: this.button("", "New", "newMap"),
      shareMap: this.button("bi-share-fill", "Share", "shareMap"),
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
      <div class="shareMap"></div>
    </nav>
    `;
    this.nodes = Component.attachComponentsToNodes(
      this.components,
      this.target
    );
    this.style();
  }

  update(i: boolean | "renderInfo" | "saved" | "unsaved"): void {
    if (i === "renderInfo") {
      this.info().render(this.nodes.mapInfo);
    } else {
      if (i === "unsaved") this.saved = false;
      if (i === "saved") this.saved = true;
      this.style();
    }
  }

  style(): void {
    const saving = this.editor.state.name === "saving";
    this.nodes.undoEdit.classList.toggle(
      "inactive",
      this.editor.editHistory.onBottom()
    );
    this.nodes.redoEdit.classList.toggle(
      "inactive",
      this.editor.editHistory.onTop()
    );
    this.nodes.saveMap.classList.toggle(
      "inactive",
      saving || !this.editor.api.canSave()
    );
    this.nodes.mapInfo.classList.toggle("saving", saving);
    this.nodes.mapInfo.classList.toggle("saved", this.saved);
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
        const mapName = this.editor.mapData.map_name || "Untitled Map";

        t.innerHTML = `
        <div class="map-name-line">
        <h1>${mapName} 
        </h1>
        <button class="editMapName on edit-button">Edit name</button>
        <div class="nameEditor">
        <input class="mapNameInput" value="${mapName}"></input>
        <a class="nameEditorSubmit edit-button">Done</a>
        </div>
        <span class="saving-indicator">Saving map...  </span>
        <span class="map-saved-indicator">Map saved!</span>
        `;
        const nodes = Component.getNodesByClass(
          ["editMapName", "nameEditor", "nameEditorSubmit", "mapNameInput"],
          t
        );

        nodes.editMapName.addEventListener("click", (ev) => {
          ev.stopPropagation();
          nodes.nameEditor.classList.toggle("on");
          nodes.editMapName.classList.toggle("on");
        });
        nodes.nameEditorSubmit.addEventListener("click", (ev) => {
          ev.stopPropagation();
          //nodes.nameEditor.classList.toggle("on");
          //nodes.editMapName.classList.toggle("on");
          this.editor.mapData.map_name = (nodes.mapNameInput as HTMLInputElement).value;
          this.update("renderInfo");
        });
      },
    };
  }
}
