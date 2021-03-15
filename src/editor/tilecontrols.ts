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
    <div class="rotateCCW"></div>
    <div class="resetRotation"></div>
    <div class="rotateCW"></div>
    <div class="flipTile"></div>
    <div class="clearTiles"></div>
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
    if (edState.name === "selection" && edState.selection.length === 1) {
      const sel = edState.selection[0];
      const [tw, th] = [
        this.boardView.sizeFactor * this.boardView.tileWidth,
        this.boardView.sizeFactor * this.boardView.tileHeight,
      ];
      const [x_rel, y_rel] = Hex.spiralToXY(sel, tw, th);
      const [x, y] = [
        this.boardView.leftOffset + x_rel,
        this.boardView.topOffset - y_rel,
      ];
      this.target.style.display = "block";
      position(this.nodes.rotateCCW, x - 0.2 * tw, y + 0.2 * th);
      position(this.nodes.rotateCW, x + 0.8 * tw, y + 0.2 * th);
      position(this.nodes.resetRotation, x + 0.3 * tw, y - 0.1 * th);
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

function position(node: HTMLElement, left: number, top: number): void {
  node.style.left = `${left}px`;
  node.style.top = `${top}px`;
}
