import "./boardcontrols.css";
import Component from "../lib/component";
import Editor from "./editor";
import BoardView from "./boardview";

export default class BoardControls extends Component {
  boardView: BoardView;
  nodes!: Record<string, HTMLElement>;
  components!: Record<string, Component>;
  target!: HTMLElement;

  constructor(boardView: BoardView) {
    super();
    this.boardView = boardView;
    this.components = {
      zoomIn: this.button("", "Zoom in", "zoomIn"),
      zoomOut: this.button("", "Zoom out", "zoomOut"),
      addRing: this.button("", "Add ring", "addRing"),
      removeRing: this.button("", "Remove ring", "removeRing"),
      toggleNumbers: this.button("", "Toggle numbers", "toggleNumbers"),
    };
  }

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    <div class="mapInfo"></div>
    <nav class="board-controls-wrapper">
      <div class="zoomIn"></div>
      <div class="zoomOut"></div>
      <div class="addRing"></div>
      <div class="removeRing"></div>
      <div class="toggleNumbers"></div>
    </nav>
    `;
    this.nodes = Component.attachComponentsToNodes(
      this.components,
      this.target
    );
    this.style();
  }

  style(): void {
    //this.nodes.undoEdit.classList.toggle("inactive", false /*TODO*/);
    //this.nodes.redoEdit.classList.toggle("inactive", false /*TODO*/);
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
}
