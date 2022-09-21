declare interface Primitives {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  null: null;
  undefined: undefined;
}

declare type Primitive = Primitives[keyof Primitives];

declare abstract class Type<A> {
  private readonly covariant: A;
}

declare type Types<A> = {
  [T in keyof A]: Type<A[T]>;
};

declare type Typedef<A> = A extends Type<infer T> ? T : never;

declare const unknown: Type<unknown>;
declare const never: Type<never>;
declare const primitive: <A extends keyof Primitives>(
  type: A
) => Type<Primitives[A]>;
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
declare const fix: <A>(combinator: (type: Type<A>) => Type<A>) => Type<A>;

export type { Primitives, Primitive, Type, Types, Typedef };
export {
  unknown,
  never,
  string,
  number,
  bigint,
  boolean,
  symbol,
  primitive,
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
  fix,
};
