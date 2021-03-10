import "./boardcontrols.css";
import Component from "../lib/component";

export default class BoardControls extends Component {
  nodes!: Record<string, HTMLElement>;
  components!: Record<string, Component>;
  target!: HTMLElement;

  constructor() {
    super();
    this.components = {
      mapInfo: this.info(),
      toggleNumbers: this.button("", "toggleNumbers", "toggleOverlay"),
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
    <nav class="board-controls-wrapper">
      <div class="undoEdit"></div>
      <div class="redoEdit"></div>
      <div class="saveMap"></div>
      <div class="newMap"></div>
      <div class="toggleNumbers"></div>
    </nav>
    `;
    this.nodes = Component.attachComponentsToNodes(
      this.components,
      this.target
    );
  }

  button(
    bootstrapIcon: string,
    text: string,
    eventName: string,
    detail?: unknown
  ): Component {
    return {
      render: (el: HTMLElement) => {
        el.classList.add("board-controls-button");
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
