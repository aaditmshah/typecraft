import type { Primitive, Type } from "./types";

declare type Cast<A> =
  | { status: "success"; values: A[] }
  | { status: "failure"; expected: "never"; actual: unknown }
  | { status: "failure"; expected: "string"; actual: unknown }
  | { status: "failure"; expected: "number"; actual: unknown }
  | { status: "failure"; expected: "bigint"; actual: unknown }
  | { status: "failure"; expected: "boolean"; actual: unknown }
  | { status: "failure"; expected: "symbol"; actual: unknown }
  | { status: "failure"; expected: "null"; actual: unknown }
  | { status: "failure"; expected: "undefined"; actual: unknown }
  | {
      status: "failure";
      expected: "array";
      items?: Cast<unknown>[];
      actual: unknown;
    }
  | {
      status: "failure";
      expected: "tuple";
      length: number;
      items?: Cast<unknown>[];
      actual: unknown;
    }
  | {
      status: "failure";
      expected: "record";
      properties?: Record<PropertyKey, Cast<unknown>>;
      actual: unknown;
    }
  | {
      status: "failure";
      expected: "record";
      properties?: Record<PropertyKey, Cast<unknown>>;
      actual: unknown;
    }
  | {
      status: "failure";
      expected: "enumeration";
      values: Set<Primitive>;
      actual: unknown;
    }
  | { status: "failure"; expected: "union"; variants: Cast<never>[] }
  | { status: "failure"; expected: "intersection"; results: Cast<unknown>[] }
  | { status: "unbound"; symbol: symbol };

declare const cast: <A>(type: Type<A>) => (input: unknown) => Cast<A>;

export type { Cast };
export { cast };
