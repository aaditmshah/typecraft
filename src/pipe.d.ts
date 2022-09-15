// eslint-disable-next-line max-classes-per-file -- abstract data types
declare type Morphism<A, B> = (a: A) => B;

declare abstract class Pipe<A, B> {
  private readonly pipe: Morphism<A, B>;
}

declare abstract class Composition<A, B> {
  private readonly composition: Morphism<A, B>;
}

declare const tap: <A>() => Pipe<A, A>;

declare const nil: <A>() => Composition<A, A>;

declare const pipe: <A, B, C>(
  head: Morphism<A, B>,
  tail: Pipe<B, C>
) => Pipe<A, C>;

declare const cons: <A, B, C>(
  head: Morphism<B, C>,
  tail: Composition<A, B>
) => Composition<A, C>;

declare const backwards: <A, B>(pipe: Pipe<A, B>) => Composition<A, B>;

declare const reverse: <A, B>(composition: Composition<A, B>) => Pipe<A, B>;

declare const feed: <A, B>(pipe: Pipe<A, B>) => Morphism<A, B>;

declare const apply: <A, B>(composition: Composition<A, B>) => Morphism<A, B>;

export type { Morphism, Pipe, Composition };
export { tap, nil, pipe, cons, backwards, reverse, feed, apply };
