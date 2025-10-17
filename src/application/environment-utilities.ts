/* eslint-disable security/detect-object-injection */
type Coerce<T> = (raw: string) => T;

export const asString: Coerce<string> = (v) => v;
export const asNumber: Coerce<number> = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`Expected number, got "${v}"`);
  return n;
};
export const asBool: Coerce<boolean> = (v) => /^(1|true|yes|on)$/i.test(v);

export interface Spec<T> {
  key: string;
  parse?: Coerce<T>;
  default_?: T; // if omitted, var is required
  allowEmpty?: boolean; // treat empty string as valid
}

export function read<T>({
  key,
  parse = asString as Coerce<T>,
  default_,
  allowEmpty,
}: Spec<T>): T {
  const raw = process.env[key];
  if (raw == null || (!allowEmpty && raw === "")) {
    if (default_ !== undefined) return default_;
    throw new Error(`Missing required env var: ${key}`);
  }
  return parse(raw);
}
