declare type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;

declare abstract class Type<A> {
  private readonly covariant: A;
}

declare type Types<A> = {
  [T in keyof A]: Type<A[T]>;
};

declare type Typedef<A> = A extends Type<infer T> ? T : never;

declare type Combinators<A> = {
  [T in keyof A]: (propTypes: Types<A>) => Type<A[T]>;
};

declare const unknown: Type<unknown>;
declare const never: Type<never>;
declare const string: Type<string>;
declare const number: Type<number>;
declare const bigint: Type<bigint>;
declare const boolean: Type<boolean>;
declare const symbol: Type<symbol>;
declare const array: <A>(type: Type<A>) => Type<A[]>;
declare const tuple: <A extends unknown[]>(...types: Types<A>) => Type<A>;
declare const record: <A>(type: Type<A>) => Type<Record<PropertyKey, A>>;
declare const object: <A extends {}>(propTypes: Types<A>) => Type<A>;
declare const nullable: <A>(type: Type<A>) => Type<A | null>;
declare const optional: <A>(type: Type<A>) => Type<A | undefined>;
declare const enumeration: <A extends Primitive[]>(
  ...values: A
) => Type<A[number]>;
declare const union: <A extends unknown[]>(
  ...types: Types<A>
) => Type<A[number]>;
declare const intersection: <A extends unknown[]>(
  ...types: Types<A>
) => Type<A>;
declare const pure: <A>(value: A) => Type<A>;
declare const map: <A, B>(morphism: (a: A) => B, type: Type<A>) => Type<B>;
declare const fix: <A extends {}>(combinators: Combinators<A>) => Types<A>;

export type { Primitive, Type, Types, Typedef, Combinators };
export {
  unknown,
  never,
  string,
  number,
  bigint,
  boolean,
  symbol,
  array,
  tuple,
  record,
  object,
  nullable,
  optional,
  enumeration,
  union,
  intersection,
  pure,
  map,
  fix
};
