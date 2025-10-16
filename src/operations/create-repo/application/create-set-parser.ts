export function createSetParser<T extends string>(values: Set<T>) {
  return (raw: string): T => {
    if (values.has(raw as T)) return raw as T;
    // create a stable list for the message
    const allowed = [...values].join(", ");
    throw new Error(`Expected one of ${allowed}, got "${raw}"`);
  };
}
