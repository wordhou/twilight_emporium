function addToArray<T>(array: Array<T>, item: T): Array<T> {
  return array.includes(item) ? array.slice() : array.concat(item);
}

function removeFromArray<T>(array: Array<T>, item: T): Array<T> {
  return array.filter((i) => i !== item);
}

function toggleMembershipInArray<T>(array: Array<T>, item: T): Array<T> {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : array.concat(item);
}

function toggleMembership<T>(set: Set<T>, item: T): void {
  if (set.has(item)) set.delete(item);
  else set.add(item);
}

function zip<T, U>(xs: Array<T>, ys: Array<U>): Array<[T, U]> {
  if (xs.length <= ys.length) return xs.map((x, i) => [x, ys[i]]);
  else return ys.map((y, i) => [xs[i], y]);
}

export {
  addToArray,
  removeFromArray,
  toggleMembershipInArray,
  toggleMembership,
  zip,
};
