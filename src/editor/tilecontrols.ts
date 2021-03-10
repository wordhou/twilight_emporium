import "bootstrap-icons/font/bootstrap-icons.css";
import "./tilecontrols.css";

export default class TileControls {
  nodes!: Record<string, HTMLElement>;
  target!: HTMLElement;

  constructor() {}

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = ``;
    this.nodes = {
      rotateCCW: button("", "Rotate CCW", "rotateTile", "ccw"),
      resetRotation: button("", "Reset rotation", "resetRotation"),
      rotateCW: button("", "Rotate CW", "rotateTile", "cw"),
      flip: button("", "Flip over", ""),
    };
    const inner = target.appendChild(document.createElement(`div`));
    Object.entries(this.nodes).forEach(([_, el]) => {
      inner.appendChild(el);
    });
  }
}

const button = (
  bootstrapIcon: string,
  alt: string,
  eventName: string,
  detail?: unknown
) => {
  const el = document.createElement("div");
  el.classList.add("tilecontrols-button");
  el.innerHTML = `<a><i class="${bootstrapIcon}"></i>${alt}</a>`;
  el.addEventListener("click", () => {
    const customEvent = new CustomEvent(eventName, { bubbles: true, detail });
    el.dispatchEvent(customEvent);
  });
  return el;
};
