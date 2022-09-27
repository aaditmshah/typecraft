import type { Morphism, Pipeline } from "./pipeline";

declare abstract class Composition<A, B> {
  private readonly apply: Morphism<A, B>;
}

declare const id: <A>() => Composition<A, A>;

declare const compose: <A, B, C>(
  morphism: Morphism<B, C>,
  composition: Composition<A, B>
) => Composition<A, C>;

declare const assoc: <A, B>(composition: Composition<A, B>) => Pipeline<A, B>;

declare const apply: <A, B>(composition: Composition<A, B>) => Morphism<A, B>;

export type { Composition };
export { id, compose, assoc, apply };
