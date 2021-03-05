import PriorityQueue from "./priorityQueue";

const lists = [
  [1, 2, 3],
  [3, 2, 1],
  [4, 1, 3, 2],
  [1, 10, 2, 9, 3, 7, 4, 6, 5],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [18, 14, 11, 13, 12, 10, 4, 3, 1, 5],
  [12, 10, 8, 6, 3, 5, 7, 9, 10, 11, 3, 2, 1, 5],
];

/*
 * Generates some random tests and adds them to the lists array;
const randomList: (n: number) => number[] = (n) =>
  Array(n)
    .fill(0)
    .map(() => Math.random());

[10, 25, 50, 100, 200, 250, 500, 1000, 10000].forEach((n) =>
  lists.push(randomList(n))
);
*/

test("new priority queue is empty", () => {
  const q = new PriorityQueue<number, string>();
  expect(q.isEmpty()).toBe(true);
});

test("repeated insert creates heap with right number of elements", () => {
  for (const l of lists) {
    const q = new PriorityQueue<number, null>();
    l.forEach((n) => q.insert(n, null));
    expect(q.size).toBe(l.length);
  }
});

test("repeated insert satisfies heap property", () => {
  for (const l of lists) {
    const q = new PriorityQueue<number, null>();
    l.forEach((n) => {
      q.insert(n, null);
      expect(q._hasHeapProperty()).toBe(true);
    });
  }
});

test("repeated pull sorts elements", () => {
  for (const l of lists) {
    const q = new PriorityQueue<number, null>();
    l.forEach((n) => q.insert(n, null));
    const a = [];
    while (!q.isEmpty()) a.push((q.pull() || [])[0]);
    expect(a).toStrictEqual(l.slice().sort((a, b) => a - b));
  }
});

test("build-heap creates heap with right number of elements", () => {
  for (const l of lists) {
    const q = new PriorityQueue<number, null>(
      l,
      l.map(() => null)
    );
    expect(q.size).toBe(l.length);
  }
});

test("build-heap to satisfy heap property", () => {
  for (const l of lists) {
    const q = new PriorityQueue<number, null>(
      l,
      l.map(() => null)
    );
    expect(q._hasHeapProperty()).toBe(true);
  }
});

test("pull maintains heap property", () => {
  for (const l of lists) {
    const q = new PriorityQueue<number, null>(
      l,
      l.map(() => null)
    );
    q.pull();
    expect(q._hasHeapProperty()).toBe(true);
    q.pull();
    expect(q._hasHeapProperty()).toBe(true);
    q.pull();
    expect(q._hasHeapProperty()).toBe(true);
  }
});

test("pull-insert maintains heap property", () => {
  for (const l of lists) {
    const q = new PriorityQueue<number, null>(
      l,
      l.map(() => null)
    );
    q.pullInsert(5, null);
    expect(q._hasHeapProperty()).toBe(true);
    q.pullInsert(0.5, null);
    expect(q._hasHeapProperty()).toBe(true);
    q.pullInsert(0.1, null);
    expect(q._hasHeapProperty()).toBe(true);
    q.pullInsert(-1, null);
    expect(q.pull()).toStrictEqual([-1, null]);
  }
});

test("peek finds minimum", () => {
  for (const l of lists) {
    const q = new PriorityQueue<number, null>(
      l,
      l.map(() => null)
    );
    const min = l.reduce((a, b) => Math.min(a, b), Infinity);
    expect(q.peek()).toStrictEqual([min, null]);
  }
});

test("pull on empty returns undefined", () => {
  const q = new PriorityQueue<number, null>();
  expect(q.pull()).toBeUndefined();
});

test("peek on empty returns undefined", () => {
  const q = new PriorityQueue<number, null>();
  expect(q.peek()).toBeUndefined();
});

test("pullInsert on empty returns undefined", () => {
  const q = new PriorityQueue<number, null>();
  expect(q.pullInsert(5, null)).toBeUndefined();
});
/*
test("?", () => {
  expect();
});
*/
