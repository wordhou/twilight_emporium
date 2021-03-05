/**
 * A minimum priority queue implementation. The head of the priority queue is the element with the lowest priority.
 */
export default class PriorityQueue<P, T> {
  private priorities: P[];
  private items: T[];
  private _size: number;

  get size(): number {
    return this._size;
  }

  constructor(priorities: P[] = [], items: T[] = []) {
    this.priorities = priorities;
    this.items = items;
    this._size = priorities.length;
    this.heapify();
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  insert(p: P, item: T): void {
    const s = this._size;
    ++this._size;
    this.priorities[s] = p;
    this.items[s] = item;
    this.siftUp(s); //sift up last element
  }

  peek(): [P, T] | undefined {
    if (this.size === 0) return undefined;
    return [this.priorities[0], this.items[0]];
  }

  peekItem(): T | undefined {
    if (this.size === 0) return undefined;
    return this.items[0];
  }

  peekPriority(): P | undefined {
    if (this.size === 0) return undefined;
    return this.priorities[0];
  }

  pull(): [P, T] | undefined {
    if (this.size === 0) return undefined;
    const s = this._size;
    --this._size;
    let i = 0;
    while (2 * i + 1 < s) {
      const c =
        2 * i + 2 === s || this.compare(2 * i + 1, 2 * i + 2)
          ? 2 * i + 1
          : 2 * i + 2;
      this.swap(i, c);
      i = c;
    }
    if (i < s - 1) {
      this.swap(i, s - 1);
      this.siftUp(i);
    }
    return [this.priorities[s - 1], this.items[s - 1]];
  }

  pullInsert(p: P, item: T): [P, T] | undefined {
    if (this.size === 0) return undefined;
    const r = this.peek();
    this.priorities[0] = p;
    this.items[0] = item;
    this.siftDown(0);
    return r;
  }

  private compare(i: number, j: number): boolean {
    return this.priorities[i] < this.priorities[j];
  }

  private swap(i: number, j: number): void {
    const tp = this.priorities[i];
    const ti = this.items[i];
    this.priorities[i] = this.priorities[j];
    this.items[i] = this.items[j];
    this.priorities[j] = tp;
    this.items[j] = ti;
  }

  private siftDown(i: number): void {
    while (2 * i + 1 < this.size) {
      const c =
        2 * i + 2 >= this.size || this.compare(2 * i + 1, 2 * i + 2)
          ? 2 * i + 1
          : 2 * i + 2;

      if (this.compare(i, c)) return;
      this.swap(i, c);
      i = c;
    }
  }

  private siftUp(i: number): void {
    while (i !== 0) {
      const p = (i - 1) >> 1;
      if (this.compare(i, p)) {
        this.swap(i, p);
        i = p;
      } else return;
    }
  }

  private heapify(): void {
    for (let i = this.size >> 1; i >= 0; i--) this.siftDown(i);
  }

  _hasHeapProperty(): boolean {
    for (let i = 1; i < this.size; i++)
      if (this.compare(i, (i - 1) >> 1)) return false;
    return true;
  }
}
