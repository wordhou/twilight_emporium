import { State, Edit, Reset, EditHistory } from "./chain";

class Num implements State {
  x: number[];
  constructor(x: number) {
    this.x = [x];
  }
  clone() {
    return new Num(this.x[0]) as this;
  }
}

class Add implements Edit<Num> {
  y: number;
  constructor(y: number) {
    this.y = y;
  }
  get reversible(): boolean {
    return true;
  }
  forward(st: Num): void {
    st.x[0] += this.y;
  }
  backward(st: Num): void {
    st.x[0] -= this.y;
  }
}

class Mult implements Edit<Num> {
  f: number;
  o?: number;

  constructor(f: number) {
    this.f = f;
  }
  get reversible(): boolean {
    return this.o !== undefined;
  }
  forward(st: Num): void {
    this.o = st.x[0];
    st.x[0] *= this.f;
  }
  backward(st: Num): void {
    st.x[0] = this.o as number;
  }
}

class SetNum implements Reset<Num> {
  state: Num;
  constructor(st: Num) {
    this.state = st;
  }
}

const edits = [
  new Add(5), // 10
  new Mult(0), // 0
  new Add(2), // 2
  new Mult(2), // 4
  new Add(10), // 14
  new Mult(2), // 28
  new Mult(2), // 56
];

const manyEdits = [
  new Add(2),
  new Add(1),
  new Mult(2),
  new Add(-4),
  new Add(1),
  new Mult(-1),
  new Mult(2),
  new SetNum(new Num(2)),
  new Add(4),
  new Add(-3),
  new Mult(3),
  new Add(-1),
  new Mult(0),
  new Add(2),
];

test("EditChain has current equal to starting state", () => {
  const num = new Num(5);
  const eh = new EditHistory(num);
  expect(eh.current).toEqual(num);
});

test("Adding edit modifies state", () => {
  const eh = new EditHistory(new Num(5));
  eh.add(new Add(3));
  expect(eh.current.x[0]).toEqual(8);
});

test("Accepts multiple edits", () => {
  const eh = new EditHistory(new Num(5));
  [2, 1, -5, 5, 10].forEach((y) => eh.add(new Add(y)));
  expect(eh.current.x[0]).toEqual(18);
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1].forEach((y) => eh.add(new Add(y)));
  expect(eh.current.x[0]).toEqual(28);
});

test("Accepts multiple edits when some are non-reversible", () => {
  const eh = new EditHistory(new Num(5));
  edits.forEach((ed) => eh.add(ed));
  expect(eh.current.x[0]).toEqual(56);
});

test("Accepts reset", () => {
  const eh = new EditHistory(new Num(5));
  const num2 = new Num(11);
  [new Add(2), new Mult(0), new Add(100), new SetNum(num2)].forEach((ed) =>
    eh.add(ed)
  );
  expect(eh.current.x[0]).toEqual(11);
});

test("Accepts reset and then some edits", () => {
  const num2 = new Num(11);
  const eh = new EditHistory(new Num(5));
  [
    new Add(2),
    new SetNum(num2),
    new Mult(2),
    new Mult(3),
    new Add(-33),
  ].forEach((ed) => eh.add(ed));
  expect(eh.current.x[0]).toEqual(33);
  manyEdits.forEach((ed) => eh.add(ed));
  expect(eh.current.x[0]).toEqual(2);
});

test("Does some undos", () => {
  const eh = new EditHistory(new Num(5));
  edits.forEach((ed) => eh.add(ed));
  [28, 14, 4, 2, 0, 10].forEach((n) => {
    eh.undo();
    expect(eh.current.x[0]).toEqual(n);
  });
});

test("Does some undos and redos", () => {
  const eh = new EditHistory(new Num(5));
  edits.forEach((ed) => eh.add(ed));
  [28, 14, 4, 2].forEach(() => {
    eh.undo();
  });
  [4, 14, 28, 56].forEach((n) => {
    eh.redo();
    expect(eh.current.x[0]).toEqual(n);
  });
});

test("Does some undos and redos", () => {
  const eh = new EditHistory(new Num(5));
  edits.forEach((ed) => eh.add(ed));
  [28, 14, 4, 2].forEach(() => {
    eh.undo();
  });
  [4, 14, 28, 56].forEach((n) => {
    eh.redo();
    expect(eh.current.x[0]).toEqual(n);
  });
});

test("Undo followed by redos doesn't change state", () => {
  const eh = new EditHistory(new Num(5));
  edits.forEach((ed) => eh.add(ed));
  eh.undo();
  eh.redo();
  expect(eh.current.x[0]).toEqual(56);
});
