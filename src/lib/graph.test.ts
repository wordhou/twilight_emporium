import {
  AdjacencyListGraph,
  isUndirected,
  dfsPreorder,
  bfs,
  stronglyConnectedComponents,
  reachableVertices,
} from "./graph";

const undirectedMaps = ([
  [
    [1, [2, 3]],
    [2, [1, 4]],
    [3, [1]],
    [4, [2]],
  ],
  [
    [1, [2, 3]],
    [2, [1]],
    [3, [1]],

    [4, [5, 6]],
    [5, [4]],
    [6, [4, 7]],
    [7, [6]],
  ],
  [
    [1, [2, 3, 4]],
    [2, [1]],
    [3, [1, 4]],
    [4, [1, 3, 5, 6]],
    [5, [4]],
    [6, [4, 7]],
    [7, [6]],
  ],
] as [number, number[]][][]).map((a) => new Map(a));

const d1 = new Map([
  [1, [2, 3]],
  [2, [4]],
  [3, [4]],
  [4, [1]],
]);

test("depth first search reaches elements in order in simple graph", () => {
  const g = new AdjacencyListGraph(undirectedMaps[0]);
  const a: number[] = [];
  dfsPreorder(g, 1, (n) => {
    a.push(n);
    return;
  });
  expect(a).toStrictEqual([1, 3, 2, 4]);
});

test("depth first search doesn't leave connected component", () => {
  const g = new AdjacencyListGraph(undirectedMaps[1]);
  const a: number[] = [];
  dfsPreorder(g, 6, (n) => {
    a.push(n);
    return;
  });
  expect(a.sort()).toStrictEqual([4, 5, 6, 7]);
});

test("breadth first search reaches elements in order in simple graph", () => {
  const g = new AdjacencyListGraph(undirectedMaps[0]);
  const a: number[] = [];
  bfs(g, 1, (n) => {
    a.push(n);
    return;
  });
  expect(a).toStrictEqual([1, 2, 3, 4]);
});

test("depth first search doesn't leave connected component", () => {
  const g = new AdjacencyListGraph(undirectedMaps[1]);
  const a: number[] = [];
  bfs(g, 6, (n) => {
    a.push(n);
    return;
  });
  expect(a.sort()).toStrictEqual([4, 5, 6, 7]);
});

test("isUndirected on undirected graph is true", () => {
  const graphs = undirectedMaps.map((m) => new AdjacencyListGraph(m));
  expect(graphs.every((g) => isUndirected(g))).toBe(true);
});

test("isUndirected on directed graph is false", () => {
  const g = new AdjacencyListGraph(d1);
  expect(isUndirected(g)).toBe(false);
});

test("strongly connected components finds component in a connected graph", () => {
  const scc = stronglyConnectedComponents(
    new AdjacencyListGraph(undirectedMaps[0])
  );
  expect(scc).toHaveLength(1);
  expect(scc[0].sort()).toStrictEqual([1, 2, 3, 4]);
});

test("strongly connected components on singletons", () => {
  const singletons = [1, 2, 3, 4, 5];
  const g = new AdjacencyListGraph(new Map(singletons.map((n) => [n, []])));
  const scc = stronglyConnectedComponents(g);
  expect(scc.every((a) => a.length == 1)).toBe(true);
  expect(scc.map((a) => a[0])).toStrictEqual(singletons);
});

test("strongly connected components finds two components", () => {
  const scc = stronglyConnectedComponents(
    new AdjacencyListGraph(undirectedMaps[1])
  );
  expect(scc).toHaveLength(2);
  expect(scc.map((a) => a.sort()).sort()).toStrictEqual([
    [1, 2, 3],
    [4, 5, 6, 7],
  ]);
});

test("reachableVertices with steps 0", () => {
  const g = new AdjacencyListGraph(undirectedMaps[1]);
  expect(Array.from(reachableVertices(g, 1, 0)).sort()).toStrictEqual([1]);
});

test("reachableVertices with steps 1", () => {
  const g = new AdjacencyListGraph(undirectedMaps[1]);
  expect(Array.from(reachableVertices(g, 1, 1)).sort()).toStrictEqual([
    1,
    2,
    3,
  ]);
});

test("reachableVertices with steps 2", () => {
  const g = new AdjacencyListGraph(undirectedMaps[2]);
  expect(Array.from(reachableVertices(g, 1, 2)).sort()).toStrictEqual([
    1,
    2,
    3,
    4,
    5,
    6,
  ]);
});
