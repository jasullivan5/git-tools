export function createArrayParser<const T extends readonly string[]>(
  values: T,
) {
  const set = new Set(values);
  const allowed = values.join(", ");

  return (raw: string): T[number] => {
    if (set.has(raw as T[number])) return raw as T[number];
    throw new Error(`Expected one of ${allowed}, got "${raw}"`);
  };
}
