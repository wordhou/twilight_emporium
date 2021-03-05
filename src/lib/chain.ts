/*
 * EditChain
 */

interface State<S> {
  clone: () => State<S>;
}

class InvalidEditError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class CorruptedStateError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Describes an object that has a forward
 */
interface Edit<S> {
  forward: (st: State<S>) => void | Error;
}

interface ReversibleEdit<S> extends Edit<S> {
  reversible: boolean;
  backward: (st: State<S>) => void | Error;
}

function isReversibleEdit<S>(ed: Edit<S>): ed is ReversibleEdit<S> {
  return "reversible" in ed;
}

function isReversible<S>(ed: ReversibleEdit<S>): boolean {
  return ed.reversible;
}

interface IEditChain<S> {
  current: State<S>;
  add: (ed: Edit<S>) => void;
  undo: (steps?: number) => boolean;
  redo: (steps?: number) => boolean;
}

class ChainLink<S> {
  init: State<S>;
  edits: Edit<S>[];
  // TODO: (later) Reversible Edits
  constructor(init: State<S>, edits?: Edit<S>[]) {
    this.init = init;
    this.edits = edits === undefined ? [] : edits;
  }
}

/**
 * Maintains the current State of an object, as well as a history of edits to that object. Allows methods to traverse through the history of the object via undo, redo and jump.
 */
class EditChain<S> implements IEditChain<S> {
  private chain: ChainLink<S>[];
  private _current: State<S>;
  private linkIndex: number;
  private editIndex: number;

  constructor(st: State<S>) {
    this.chain = [new ChainLink(st)];
    this._current = st.clone();
    this.linkIndex = 0;
    this.editIndex = 0;
  }

  get current(): State<S> {
    return this._current;
  }

  onTop(): boolean {
    const lastIndex = this.chain.length - 1;
    return (
      this.linkIndex === lastIndex &&
      this.editIndex === this.chain[lastIndex].edits.length - 1
    );
  }

  add(ed: Edit<S>): void {
    // Check if current position is top of edit chain
    if (!this.onTop()) {
      this.chain.length = this.linkIndex + 1;
      this.chain[this.chain.length - 1].edits.length = this.editIndex;
    }

    const topLink = this.chain[this.chain.length - 1];
    topLink.edits.push(ed);
    this.editIndex = 0;
    this.linkIndex++;
    ed.forward(this._current);
    this.chain.push(new ChainLink(this._current.clone()));
  }

  undo(steps?: number): boolean {
    if (steps === undefined) steps = 1;

    return true;
  }

  redo(steps?: number): boolean {
    if (steps === undefined) steps = 1;

    return true;
  }
}

export {
  State,
  Edit,
  ReversibleEdit,
  EditChain,
  InvalidEditError,
  CorruptedStateError,
};
