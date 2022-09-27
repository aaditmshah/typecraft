import fc from "fast-check";
import { id, compose, apply } from "./composition";

describe("composition", () => {
  describe("id", () => {
    it("should return the identity function", () => {
      expect.assertions(100);
      const morphism = apply(id());
      fc.assert(
        fc.property(fc.anything(), (input) => {
          expect(morphism(input)).toStrictEqual(input);
        })
      );
    });
  });

  describe("compose", () => {
    it("should return the composite function", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.func(fc.integer()),
          fc.func(fc.string()),
          fc.anything(),
          (second, first, input) => {
            const morphism = apply(
              compose(second, compose(first, id<unknown>()))
            );
            expect(morphism(input)).toBe(second(first(input)));
          }
        )
      );
    });
  });
});
