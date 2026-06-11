// src/lib/transform.ts

type CamelToSnake<S extends string> = S extends `${infer Head}${infer Tail}`
  ? Head extends Uppercase<Head>
    ? `_${Lowercase<Head>}${CamelToSnake<Tail>}`
    : `${Head}${CamelToSnake<Tail>}`
  : S;

type SnakeToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`
  : S;

export type CamelToSnakeCase<T> = {
  [K in keyof T as CamelToSnake<string & K>]: T[K];
};

export type SnakeToCamelCase<T> = {
  [K in keyof T as SnakeToCamel<string & K>]: T[K];
};

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function objectToSnakeCase<T extends object>(
  obj: T,
): CamelToSnakeCase<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [toSnakeCase(key), value]),
  ) as CamelToSnakeCase<T>;
}

export function objectToCamelCase<T extends object>(
  obj: T,
): SnakeToCamelCase<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [toCamelCase(key), value]),
  ) as SnakeToCamelCase<T>;
}
