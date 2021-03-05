export default class Queue<T> {
  private buffer: T[];
  private front: number;
  size: number;

  constructor() {
    this.buffer = [];
    this.front = 0;
    this.size = 0;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  enqueue(...items: T[]): void {
    ++this.size;
    this.buffer.push(...items);
  }

  dequeue(): T | null {
    if (this.isEmpty()) return null;
    --this.size;
    return this.buffer[this.front++];
  }

  peek(): T | null {
    if (this.isEmpty()) return null;
    return this.buffer[this.front];
  }

  trim(): void {
    this.buffer.splice(0, this.front);
    this.front = 0;
  }
}
