declare type Morphism<A, B> = (value: A) => B;

declare abstract class Pipeline<A, B> {
  private readonly feed: Morphism<A, B>;
}

declare const tap: <A>() => Pipeline<A, A>;

declare const pipe: <A, B, C>(
  morphism: Morphism<A, B>,
  pipeline: Pipeline<B, C>
) => Pipeline<A, C>;

declare const feed: <A, B>(pipeline: Pipeline<A, B>) => Morphism<A, B>;

export type { Morphism, Pipeline };
export { tap, pipe, feed };
