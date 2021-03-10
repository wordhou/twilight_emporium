import "bootstrap-icons/font/bootstrap-icons.css";
import "./tilecontrols.css";
import Component from "../lib/component";
import BoardView from "./boardview";
import * as Hex from "../lib/hex";

export default class TileControls extends Component {
  nodes!: Record<string, HTMLElement>;
  components!: Record<string, Component>;
  target!: HTMLElement;
  boardView: BoardView;

  constructor(boardView: BoardView) {
    super();
    this.boardView = boardView;
    this.components = {
      rotateCCW: button(
        "bi-arrow-counterclockwise",
        "Rotate",
        "rotateTile",
        "ccw"
      ),
      resetRotation: button("", "Reset", "resetRotation"),
      rotateCW: button("bi-arrow-clockwise", "Rotate", "rotateTile", "cw"),
      flipTile: button("", "Flip", "flipTiles"),
      clearTiles: button("", "Clear", "clearTiles"),
    };
  }

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    <div class="tileControlsButtonsWrapper">
    <div class="rotateCCW"></div>
    <div class="resetRotation"></div>
    <div class="rotateCW"></div>
    <div class="flipTile"></div>
    <div class="clearTiles"></div>
    </div>
    `;
    this.nodes = Component.attachComponentsToNodes(
      this.components,
      this.target
    );
    this.nodes.buttonWrapper = this.target.querySelector(
      ".tileControlsButtonsWrapper"
    ) as HTMLElement;
    this._style();
  }
  update(): void {
    this._style();
  }

  _style(): void {
    const edState = this.boardView.editorState;
    this.nodes.buttonWrapper.style.width = this.boardView.tileWidth + "px";
    this.nodes.buttonWrapper.style.height = this.boardView.tileHeight + "px";
    if (edState.name === "selection" && edState.selection.length === 1) {
      const sel = edState.selection[0];
      const [x, y] = Hex.spiralToXY(
        sel,
        this.boardView.tileWidth,
        this.boardView.tileHeight
      );
      this.target.style.top = this.boardView.topOffset - y + "px";
      this.target.style.left = this.boardView.leftOffset + x + "px";
      this.target.style.display = "block";
    } else {
      this.target.style.display = "none";
    }
  }
}

const button = (
  bootstrapIcon: string,
  alt: string,
  eventName: string,
  detail?: unknown
) => {
  return {
    render: (el: HTMLElement) => {
      el.classList.add("tile-controls-button");
      el.innerHTML = `<a><i class="${bootstrapIcon}"></i>${alt}</a>`;
      el.addEventListener("click", (ev) => {
        const customEvent = new CustomEvent(eventName, {
          bubbles: true,
          detail,
        });
        el.dispatchEvent(customEvent);
        ev.stopPropagation();
      });
    },
  };
};
