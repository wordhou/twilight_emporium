/*
 * EditChain
 */

type Result<T> = T | Error;

interface Cloneable {
  clone: () => this;
}

interface State extends Cloneable {}

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
 * Represents an edit that sets the state to a new value, rather than modifying existing state
 */
interface Reset<S extends State> {
  state: S;
  properties?: Record<string, unknown>;
}

/**
 * Represents a modification to a state value. Provides a forward method that mutates a state value, and optionally a backward method that undoes that mutation. The reversible property indicates whether or not the backward method can be performed.
 */
interface Edit<S extends State> {
  forward: (st: S) => Result<void>;
  backward?: (st: S) => Result<void>;
  reversible: boolean;
}

type ReversibleEdit<S extends State> = Required<Edit<S>>;

function isReversible<S extends State>(e: Edit<S>): e is ReversibleEdit<S> {
  return e.reversible;
}

class Cut {
  properties?: Record<string, unknown>;
  constructor(properties?: Record<string, unknown>) {
    this.properties = properties;
  }
}

type Link<S extends State> = Cut | Edit<S>;

function isEdit<S extends State>(e: Link<S>): e is Edit<S> {
  return "forward" in e;
}

interface IEditHistory<S extends State> {
  current: S;
  add: (ed: Edit<S> | Reset<S>) => void;
  undo: (steps?: number) => Result<void>;
  redo: (steps?: number) => Result<void>;
}

type EditHistoryOptions = {
  linksBeforeSnapshot?: number;
};

/**
 * Maintains the current State of an object, as well as a history of edits to that object. Allows methods to traverse through the history of the object via undo, redo and jump.
 */
class EditHistory<S extends State> implements IEditHistory<S> {
  private linksBeforeSnapshot: number;

  private chains: Chain<S>[];
  private _current: S;
  private chainIndex: number;
  private linkIndex: number;

  constructor(init: S, { linksBeforeSnapshot = 4 }: EditHistoryOptions = {}) {
    this.chains = [new Chain(init)];
    this._current = init.clone();
    this.chainIndex = 0;
    this.linkIndex = 0;
    this.linksBeforeSnapshot = linksBeforeSnapshot;
  }

  get current(): S {
    return this._current;
  }

  onTop(): boolean {
    const lastIndex = this.chains.length - 1;
    return (
      this.chainIndex === lastIndex &&
      this.linkIndex === this.chains[lastIndex].edits.length - 1
    );
  }

  add(ed: Reset<S> | Edit<S>): void {
    if (!this.onTop()) this._pruneChain();
    if (!isEdit(ed)) this._reset(ed);
    else {
      const topChain = this.chains[this.chains.length - 1];
      const err = ed.forward(this._current);
      // TODO Handle invalid state error
      // TODO Handle invalid edit error
      topChain.add(ed);
      this.linkIndex++;

      if (topChain.edits.length >= this.linksBeforeSnapshot)
        this._makeSnapshot();
    }

    this._mergeMaybe();
  }

  undo(steps = 1): Result<void> {
    let newChainIndex = this.chainIndex;
    let newLinkIndex = this.linkIndex;
    while (steps > newLinkIndex) {
      newChainIndex--;
      if (newChainIndex < 0) return new Error(`Can't undo ${steps} steps`);
      steps -= newLinkIndex;
      newLinkIndex = this.chains[newChainIndex].edits.length;
    }
    newLinkIndex -= steps;

    //do thing
  }

  redo(steps = 1): Result<void> {
    let newChainIndex = this.chainIndex;
    let newLinkIndexRev =
      this.chains[newChainIndex].edits.length - this.linkIndex;
    while (steps > newLinkIndexRev) {
      // TODO check for small index errors
      newChainIndex++;
      if (newChainIndex >= this.chains.length)
        return new Error(`Can't redo ${steps} steps`);
      steps - newLinkIndexRev;
      newLinkIndexRev = this.chains[newChainIndex].edits.length;
    }
    //TODO check for small index errors
    const newLinkIndex =
      this.chains[newChainIndex].edits.length - newLinkIndexRev + steps;
  }

  _mergeMaybe(): Result<void> {
    // TODO TODO implement heuristic for when to merge old chains
  }

  _mergeChains(start: number, end: number): Result<void> {
    const numChains = this.chains.length;
    if (
      start < 0 ||
      end < 0 ||
      start >= numChains ||
      end >= numChains ||
      end <= start
    )
      return new Error(`Invalid start and end index: ${start}, ${end}`);
    const startChain = this.chains[start];
    const splicedChains = this.chains.splice(start + 1, end - start);
    for (const ch of splicedChains) {
      const err = startChain.concat(ch);
      if (err instanceof Error) return err;
    }
  }

  _pruneChain(): void {
    this.chains.splice(this.chainIndex + 1);
    this.chains[this.chainIndex].edits.splice(this.linkIndex);
  }

  _makeSnapshot(): void {
    this.chains.push(new Chain(this._current.clone()));
    this.chainIndex = this.chains.length - 1;
    this.linkIndex = 0;
  }

  _reset(reset: Reset<S>): void {
    this._current = reset.state.clone();
    this.chains[this.chains.length - 1].edits.push(new Cut(reset.properties));
    this.chains.push(new Chain(reset.state));
    this.chainIndex = this.chains.length - 1;
    this.linkIndex = 0;
  }

  _runStateForwards(chIndex: number, liIndex: number): Result<void> {
    this.chainIndex = chIndex;
    this.linkIndex = liIndex;
    const chain = this.chains[chIndex];
    this._current = chain.init.clone();
    // TODO No bounds checking or checks for cuts right now
    for (const ed of chain.edits.slice(0, liIndex)) {
      const err = (ed as Edit<S>).forward(this._current);
      // TODO Handle errors in err
    }
  }

  _runStateBackwards(chIndex: number, liIndex: number): Result<void> {
    this.chainIndex = chIndex;
    this.linkIndex = liIndex;
    this._current = this.chains[chIndex + 1].init.clone();
    const chain = this.chains[chIndex];
    // TODO No bounds checking or checks for cuts right now
    for (const ed of chain.edits.slice(liIndex).reverse()) {
      if (ed instanceof Cut || isReversible(ed)) return new Error();
      const err = (ed as ReversibleEdit<S>).backward(this._current);
      // TODO Handle errors in err
    }
  }
}

class Chain<S extends State> {
  init: S;
  edits: Link<S>[];
  _leastIndexReversible: number;
  constructor(init: S) {
    this.init = init;
    this.edits = [];
    this._leastIndexReversible = 0;
  }

  hasCut(): boolean {
    return this.edits.length > 0 && !isEdit(this.edits[this.edits.length - 1]);
  }

  add(link: Link<S>): Result<void> {
    if (this.hasCut()) return new Error("Can't add to chain with Reset");
    this.edits.push(link);
    if (link instanceof Cut || !link.reversible)
      this._leastIndexReversible = this.edits.length;
  }

  concat(ch: Chain<S>): Result<void> {
    if (this.hasCut()) return new Error("Can't merge onto chain with Reset");
    this.edits = this.edits.concat(ch.edits);
  }

  get leastIndexReversible(): number {
    return this._leastIndexReversible;
  }
}

export {
  State,
  Edit,
  Reset,
  EditHistory,
  InvalidEditError,
  CorruptedStateError,
};
