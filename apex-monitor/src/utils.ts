export function toMapById<T extends { id?: number }>(
  data: T[],
): Map<number, T> {
  return data.reduce((agg: Map<number, T>, curr: T) => {
    if (!curr.id) return agg;
    agg.set(curr.id, curr);
    return agg;
  }, new Map<number, T>());
}

export function toMapByName<T extends { name: string }>(
  data: T[],
): Map<string, T> {
  return data.reduce((agg: Map<string, T>, curr: T) => {
    agg.set(curr.name, curr);
    return agg;
  }, new Map<string, T>());
}
