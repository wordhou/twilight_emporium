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
  forward: (st: S) => Result<unknown>;
  backward?: (st: S) => Result<unknown>;
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

const EDIT_HISTORY_MAX = 200;
const EDIT_HISTORY_NEW = 100;

/**
 * Maintains the current State of an object, as well as a history of edits to that object. Allows methods to traverse through the history of the object via undo, redo and jump.
 */
class EditHistory<S extends State> implements IEditHistory<S> {
  private states: S[];
  private index: number;

  constructor(init: S) {
    this.states = [init];
    this.index = 0;
  }

  get current(): S {
    return this.states[this.index];
  }

  onTop(): boolean {
    return this.index === this.states.length - 1;
  }

  onBottom(): boolean {
    return this.index === 0;
  }

  get _top(): S {
    return this.states[this.states.length - 1];
  }

  add(ed: Reset<S> | Edit<S>): void {
    if (!this.onTop()) this.states.splice(this.index + 1);
    if (!isEdit(ed)) {
      this.states.push(ed.state);
      this.index++;
    } else {
      this.states.push(this._top.clone());
      const err = ed.forward(this._top);
      if (err instanceof Error) {
        this.states.pop();
        return;
      }
      this.index++;
    }

    if (this.states.length === EDIT_HISTORY_MAX) {
      const reduction = EDIT_HISTORY_MAX - EDIT_HISTORY_NEW;
      this.states = this.states.slice(reduction);
      this.index -= reduction;
    }
  }

  undo(steps = 1): Result<void> {
    if (!Number.isInteger(steps) || steps <= 0)
      return Error("Steps must be a positive integer");
    if (steps > this.index) return new Error(`Can't undo ${steps} steps`);
    this.index -= steps;
  }

  redo(steps = 1): Result<void> {
    if (!Number.isInteger(steps) || steps <= 0)
      return Error("Steps must be a positive integer");
    if (this.index + steps >= this.states.length)
      return new Error(`Can't redo ${steps} steps`);
    this.index += steps;
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
