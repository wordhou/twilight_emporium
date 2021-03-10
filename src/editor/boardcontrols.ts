import "./boardcontrols.css";

export default class BoardControls {
  target?: HTMLElement;

  constructor() {}

  render(target: HTMLElement): void {
    this.target = target;
    target.innerHTML = `
    `;
  }
}
