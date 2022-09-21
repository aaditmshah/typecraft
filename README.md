# Typecraft

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/aaditmshah/typecraft/Continuous%20Deployment?logo=github)](https://github.com/aaditmshah/typecraft/actions/workflows/continuous-deployment.yml)
[![GitHub license](https://img.shields.io/github/license/aaditmshah/typecraft)](https://github.com/aaditmshah/typecraft/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/typecraft?logo=npm)](https://www.npmjs.com/package/typecraft)
[![semantic-release: gitmoji](https://img.shields.io/badge/semantic--release-gitmoji-E10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Twitter](https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2Faaditmshah%2Ftypecraft)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Faaditmshah%2Ftypecraft)

Typecraft is a library for performing type-level magic. For example, you can use it to safely typecast values.

```typescript
import type { Type } from "typecraft";
import { string, number, boolean, object, optional, cast } from "typecraft";

interface Person {
  name: string;
  age: number;
  alive?: boolean | undefined;
}

// Craft a new person type.
const person: Type<Person> = object({
  name: string,
  age: number,
  alive: optional(boolean),
});

/**
 * Create a new magic spell, a.k.a. function,
 * to typecast unknown values to person type.
 */
const personify = cast(person);

const fetchPerson = async (url: string): Promise<Person> => {
  const response = await fetch(url);
  const data: unknown = await response.json();
  const result = personify(data); // Cast the personify spell.
  switch (result.status) {
    case "success":
      return result.value; // The result contains the person value.
    case "failure":
      console.error(result); // The result has debugging information.
      throw new TypeError("Could not parse the response data.");
    // no default
  }
};
```

Typecasting a value produces an entirely new value. It follows the principle of ["parse, don't validate"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/). Hence, typecasting is more powerful than simple data validation. For example, because `Type` is functorial you can [transfigure](https://harrypotter.fandom.com/wiki/Transfiguration) a value while typecasting it using the `map` function. This is very useful when you get data from an API in one format, but you want to transform it into another format for ease of use.

```typescript
import type { Type } from "typecraft";
import { string, number, boolean, object, optional, map } from "typecraft";

interface Person {
  name: string;
  age: number;
  alive: boolean; // The alive property is required.
}

const person: Type<Person> = map(
  // Provide a default value for alive.
  ({ name, age, alive = true }) => ({
    name,
    age,
    alive,
  }),
  object({
    name: string,
    age: number,
    alive: optional(boolean),
  })
);
```

## API

### `Type`

```typescript
import type { Type } from "typecraft";
import { string, array } from "typecraft";

const strings: Type<string> = array(string);
```

`Type<A>` is a description of `A`. Think of it as a recipe to create a value of type `A`. It's the main data type of typecraft. All type combinators return a `Type`.

### `Typedef`

```typescript
import type { Typedef } from "typecraft";
import { string, array } from "typecraft";

// type Strings = string[];
type Strings = Typedef<typeof strings>;
const strings = array(string);
```

`Typedef<Type<A>>` returns the type `A`. This is useful when you want to get the type described by a type combinator.

### `unknown`

```typescript
declare const unknown: Type<unknown>;
```

```typescript
import { unknown } from "typecraft";
```

The `unknown` type combinator describes unknown values. Typecasting `unknown` returns a function which always succeeds. The resultant value is the same as the input.

### `never`

```typescript
declare const never: Type<never>;
```

```typescript
import { never } from "typecraft";
```

The `never` type combinator describes values which don't exist. Typecasting `never` returns a functions which always fails.

### `string`

```typescript
declare const string: Type<string>;
```

```typescript
import { string } from "typecraft";
```

The `string` type combinator describes strings. Typecasting `string` returns a function which only succeeds if the input is a string.

### `number`

```typescript
declare const number: Type<number>;
```

```typescript
import { number } from "typecraft";
```

The `number` type combinator describes numbers. Typecasting `number` returns a function which only succeeds if the input is a number.

### `bigint`

```typescript
declare const bigint: Type<bigint>;
```

```typescript
import { bigint } from "typecraft";
```

The `bigint` type combinator describes bigints. Typecasting `bigint` returns a function which only succeeds if the input is a bigint.

### `boolean`

```typescript
declare const boolean: Type<boolean>;
```

```typescript
import { boolean } from "typecraft";
```

The `boolean` type combinator describes booleans. Typecasting `boolean` returns a function which only succeeds if the input is a boolean.

### `symbol`

```typescript
declare const symbol: Type<symbol>;
```

```typescript
import { symbol } from "typecraft";
```

The `symbol` type combinator describes symbols. Typecasting `symbol` returns a function which only succeeds if the input is a symbol.

### `primitive`

```typescript
declare interface Primitives {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  null: null;
  undefined: undefined;
}

declare const primitive: <A extends keyof Primitives>(
  type: A
) => Type<Primitives[A]>;
```

```typescript
import type { Type } from "typecraft";
import { primitive } from "typecraft";

const nil: Type<null> = primitive("null");
const undef: Type<undefined> = primitive("undefined");
```

The `primitive` type combinator describes primitive values of a certain type. For example, `primitive("string")` describes strings. Usually, you'd want to use one of the other combinators like `string`.

### `array`

```typescript
declare const array: <A>(type: Type<A>) => Type<A[]>;
```

```typescript
import { array } from "typecraft";
```

The `array` type combinator describes arrays. It takes a single type combinator, describing items of the array, as an input.

### `tuple`

```typescript
declare type Types<A> = {
  [T in keyof A]: Type<A[T]>;
};

declare const tuple: <A extends unknown[]>(...types: Types<A>) => Type<A>;
```

```typescript
import { tuple } from "typecraft";
```

The `tuple` type combinator describes tuples. It takes zero or more type combinators, describing items of the tuple, as an input.

### `record`

```typescript
declare const record: <A>(type: Type<A>) => Type<Record<PropertyKey, A>>;
```

```typescript
import { record } from "typecraft";
```

The `record` type combinator describes records. It takes a single type combinator, describing values of the record, as an input.

### `object`

```typescript
declare type Types<A> = {
  [T in keyof A]: Type<A[T]>;
};

declare const object: <A extends {}>(propTypes: Types<A>) => Type<A>;
```

```typescript
import { object } from "typecraft";
```

The `object` type combinator describes objects. It takes a single object whose values are type combinators as an input. Typecasting `object` returns a function which only succeeds if the input is an object with the shape of the object description provided.

### `nullable`

```typescript
declare const nullable: <A>(type: Type<A>) => Type<A | null>;
```

```typescript
import { nullable } from "typecraft";
```

The `nullable` type combinator describes nullable types. It takes a single type combinator as an input.

### `optional`

```typescript
declare const optional: <A>(type: Type<A>) => Type<A | undefined>;
```

```typescript
import { optional } from "typecraft";
```

The `optional` type combinator describes optional types. It takes a single type combinator as an input.

### `enumeration`

```typescript
declare type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;

declare const enumeration: <A extends Primitive[]>(
  ...values: A
) => Type<A[number]>;
```

```typescript
import type { Typedef } from "typecraft";
import { enumeration } from "typecraft";

// type Gender = "male" | "female";
type Gender = Typedef<typeof gender>;
const gender = enumeration("male", "female");
```

The `enumeration` type combinator describes an enum of primitive values. It takes zero or more primitive values as an input.

### `union`

```typescript
declare type Types<A> = {
  [T in keyof A]: Type<A[T]>;
};

declare const union: <A extends unknown[]>(
  ...types: Types<A>
) => Type<A[number]>;
```

```typescript
import type { Primitive, Type } from "typecraft";
import {
  string,
  number,
  bigint,
  boolean,
  symbol,
  primitive,
  union,
} from "typecraft";

const simple: Type<Primitive> = union(
  string,
  number,
  bigint,
  boolean,
  symbol,
  primitive("null"),
  primitive("undefined")
);
```

The `union` type combinator describes a union of multiple types. It take one or more type combinators as an input.

### `intersection`

```typescript
declare type Types<A> = {
  [T in keyof A]: Type<A[T]>;
};

declare const intersection: <A extends unknown[]>(
  ...types: Types<A>
) => Type<A>;
```

```typescript
import type { Type } from "typecraft";
import { string, number, object, intersection } from "typecraft";

interface Foo {
  foo: string;
}

interface Bar {
  bar: string;
}

const foobar: Type<[Foo, Bar]> = intersection(
  object({ foo: string }),
  object({ bar: number })
);
```

The `intersection` type combinator describes an intersection of multiple types. It takes zero or more type combinators as an input. The type that it describes is similar to a tuple instead of a TypeScript intersection. However, it behaves like an intersection instead of a tuple.

### `pure`

```typescript
declare const pure: <A>(value: A) => Type<A>;
```

```typescript
import { pure } from "typecraft";
```

The `pure` type combinator describes a pure value. Typecasting `pure` always succeeds with the value provided and it ignores its input.

### `map`

```typescript
declare const map: <A, B>(morphism: (a: A) => B, type: Type<A>) => Type<B>;
```

```typescript
import { map } from "typecraft";
```

The `map` type combinator transforms the result of another type combinator.

### `fix`

```typescript
declare const fix: <A>(combinator: (type: Type<A>) => Type<A>) => Type<A>;
```

```typescript
import type { Type } from "typecraft";
import { number, object, nullable, fix } from "typecraft";

type List<A> = Cons<A> | null;

interface Cons<A> {
  head: A;
  tail: List<A>;
}

const list = <A>(head: Type<A>) =>
  fix<List<A>>((tail) => nullable(object({ head, tail })));
```

The `fix` type combinator describes recursive types. It takes a single type endomorphism as an input and ties the knot to create a cyclic type.

### `cast`

```typescript
declare type Cast<A> =
  | { status: "success"; value: A; values: A[] }
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
  | { status: "failure"; expected: "intersection"; results: Cast<unknown>[] };

declare const cast: <A>(type: Type<A>) => (input: unknown) => Cast<A>;
```

```typescript
import { cast } from "typecraft";
```

The `cast` function is used to create a typecasting function. It takes a `Type<A>` as an input and returns a functions which typecasts values to `A`.
