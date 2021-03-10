export interface IComponent {
  render: (target: HTMLElement) => void;
  update?: (args?: any) => void;
}

export default class Component implements IComponent {
  static getNodesFromElement(
    components: Iterable<string>,
    target: Element
  ): Record<string, HTMLElement> {
    const nodes: Record<string, HTMLElement> = {};
    for (const comp of components) {
      const node = target.querySelector(`.${comp}`);
      if (node === null)
        throw new Error(
          `Element with class ${comp} not found in target element.`
        );
      if (!(node instanceof HTMLElement)) throw new Error();
      nodes[comp] = node;
    }
    return nodes;
  }

  static attachComponentsToNodes(
    record: Record<string, IComponent>,
    target: HTMLElement
  ): Record<string, HTMLElement> {
    const nodes: Record<string, HTMLElement> = {};
    for (const className in record) {
      const node = target.querySelector(`.${className}`);
      if (node === null)
        throw new Error(
          `Element with class ${className} not found in target element.`
        );
      if (!(node instanceof HTMLElement)) throw new Error();
      nodes[className] = node;
      record[className].render(node);
    }
    return nodes;
  }

  constructor() {
    return;
  }

  render(t: HTMLElement): void {
    return;
  }
}
