import "./tileselector.css";

export default class TileSelector {
  target?: HTMLElement;

  constructor() {}

  render(target: HTMLElement): void {
    this.target = target;
  }
}
