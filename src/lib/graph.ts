import Queue from "./queue";

/** Undirected graph */
interface Graph<V> {
  vertices: () => Iterable<V>;
  neighbors: (v: V) => V[] | undefined;
  adjacent: (a: V, b: V) => boolean;
}

type Path<V> = V[];

export class AdjacencyListGraph<V> {
  private map: Map<V, V[]>;
  constructor(map: Map<V, V[]>) {
    this.map = map;
  }

  vertices(): Iterable<V> {
    return this.map.keys();
  }

  edges(): Iterable<[V, V]> {
    const map = this.map;
    return {
      [Symbol.iterator]: function* () {
        for (const [v, ns] of map.entries()) for (const n of ns) yield [v, n];
      },
    };
  }

  neighbors(v: V): V[] | undefined {
    return this.map.get(v);
  }

  adjacent(a: V, b: V): boolean {
    return (this.neighbors(a) || []).includes(b);
  }
}

export function isUndirected<V>(g: Graph<V>): boolean {
  for (const v of g.vertices())
    for (const n of g.neighbors(v) as V[])
      if (!(g.neighbors(n) as V[]).includes(v)) return false;
  return true;
}

export function dfsPreorder<V>(
  g: Graph<V>,
  v: V,
  cb: (v: V) => void | { done: boolean } = () => {
    return;
  }
): Set<V> {
  const visited: Set<V> = new Set();
  const stack: V[] = [];
  stack.push(v);
  while (true) {
    const next = stack.pop();
    if (!next) break;
    const ret = cb(next);
    if (ret && ret.done && ret.done === true) break;
    visited.add(next);
    for (const nbr of g.neighbors(next) as V[])
      if (!visited.has(nbr)) stack.push(nbr);
  }
  return visited;
}

export function stronglyConnectedComponents<V>(g: Graph<V>): V[][] {
  const unvisited = new Set(g.vertices());
  const q = new Queue<V>();
  const scc = [];
  while (unvisited.size !== 0) {
    q.enqueue(unvisited.values().next().value);
    const component: V[] = [];
    while (true) {
      const next = q.dequeue();
      if (!next) break;
      component.push(next);
      unvisited.delete(next);
      for (const nbr of g.neighbors(next) as V[])
        if (unvisited.has(nbr)) q.enqueue(nbr);
    }
    scc.push(component);
  }
  return scc;
}

export function bfs<V>(
  g: Graph<V>,
  v: V,
  cb: (v: V) => void | { done: boolean } = () => {
    return;
  }
): Set<V> {
  const visited: Set<V> = new Set();
  const queue: Queue<V> = new Queue();
  queue.enqueue(v);
  while (!queue.isEmpty()) {
    const next = queue.dequeue();
    if (!next) break;
    const ret = cb(next);
    if (ret && ret.done === true) break;
    visited.add(next);
    for (const nbr of g.neighbors(next) as V[])
      if (!visited.has(nbr)) queue.enqueue(nbr);
  }
  return visited;
}

export function reachableVertices<V>(
  g: Graph<V>,
  v: V,
  steps?: number
): Set<V> {
  if (steps === undefined) return bfs(g, v);
  const visited: Set<V> = new Set();
  const queue: Queue<[number, V]> = new Queue();
  queue.enqueue([0, v]);
  while (!queue.isEmpty()) {
    const [level, next] = queue.dequeue() as [number, V];
    visited.add(next);
    if (level < steps) {
      for (const nbr of g.neighbors(next) as V[])
        if (!visited.has(nbr)) queue.enqueue([level + 1, nbr]);
    }
  }
  return visited;
}

/*
export function shortestPath<V>(g: Graph<V>, a: V, b: V): Path<V> {
  const visited: Set<V> = new Set();
  const queue: Queue<V[]> = new Queue();
  queue.enqueue([a]);
  while (!queue.isEmpty()) {
    const next = queue.dequeue();
    if (!next) break;
    visited.add();
    for (const nbr of g.neighbors(next) as V[])
      if (!visited.has(nbr)) queue.enqueue(nbr);
  }
  return visited;
}
*/
// function allPairs
