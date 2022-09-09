import fc from "fast-check";
import { cast } from "./cast";
import type { Type } from "./types";
import {
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
  fix
} from "./types";

describe("cast", () => {
  describe("unknown", () => {
    const castUnknown = cast(unknown);

    it("should always succeed", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.anything(), (input) => {
          expect(castUnknown(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });
  });

  describe("never", () => {
    const castNever = cast(never);

    it("should always fail", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.anything(), (input) => {
          expect(castNever(input)).toStrictEqual({
            status: "failure",
            expected: "never",
            actual: input
          });
        })
      );
    });
  });

  describe("string", () => {
    const castString = cast(string);

    it("should successfully cast strings", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.string(), (input) => {
          expect(castString(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should fail to cast non-strings", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => typeof input !== "string"),
          (input) => {
            expect(castString(input)).toStrictEqual({
              status: "failure",
              expected: "string",
              actual: input
            });
          }
        )
      );
    });
  });

  describe("number", () => {
    const castNumber = cast(number);

    it("should successfully cast numbers", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.double(), (input) => {
          expect(castNumber(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should fail to cast non-numbers", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => typeof input !== "number"),
          (input) => {
            expect(castNumber(input)).toStrictEqual({
              status: "failure",
              expected: "number",
              actual: input
            });
          }
        )
      );
    });
  });

  describe("bigint", () => {
    const castBigInt = cast(bigint);

    it("should successfully cast bigints", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.bigInt(), (input) => {
          expect(castBigInt(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should fail to cast non-bigints", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => typeof input !== "bigint"),
          (input) => {
            expect(castBigInt(input)).toStrictEqual({
              status: "failure",
              expected: "bigint",
              actual: input
            });
          }
        )
      );
    });
  });

  describe("boolean", () => {
    const castBoolean = cast(boolean);

    it("should successfully cast booleans", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.boolean(), (input) => {
          expect(castBoolean(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should fail to cast non-booleans", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => typeof input !== "boolean"),
          (input) => {
            expect(castBoolean(input)).toStrictEqual({
              status: "failure",
              expected: "boolean",
              actual: input
            });
          }
        )
      );
    });
  });

  describe("symbol", () => {
    const castSymbol = cast(symbol);

    it("should successfully cast symbols", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.string(), (description) => {
          const input = Symbol(description);
          expect(castSymbol(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should fail to cast non-symbols", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => typeof input !== "symbol"),
          (input) => {
            expect(castSymbol(input)).toStrictEqual({
              status: "failure",
              expected: "symbol",
              actual: input
            });
          }
        )
      );
    });
  });

  describe("null", () => {
    const castNull = cast(primitive("null"));

    it("should successfully cast null", () => {
      expect.assertions(1);
      // eslint-disable-next-line unicorn/no-null -- testing null
      const input = null;
      expect(castNull(input)).toStrictEqual({
        status: "success",
        values: [input]
      });
    });

    it("should fail to cast non-null", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => input !== null),
          (input) => {
            expect(castNull(input)).toStrictEqual({
              status: "failure",
              expected: "null",
              actual: input
            });
          }
        )
      );
    });
  });

  describe("undefined", () => {
    const castUndefined = cast(primitive("undefined"));

    it("should successfully cast undefined", () => {
      expect.assertions(1);
      const input = undefined;
      expect(castUndefined(input)).toStrictEqual({
        status: "success",
        values: [input]
      });
    });

    it("should fail to cast non-undefined", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => typeof input !== "undefined"),
          (input) => {
            expect(castUndefined(input)).toStrictEqual({
              status: "failure",
              expected: "undefined",
              actual: input
            });
          }
        )
      );
    });
  });

  describe("array", () => {
    const castNums = cast(array(number));

    it("should successfully cast number arrays", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.array(fc.double()), (input) => {
          expect(castNums(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should fail to cast non-number arrays", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.array(
            fc.anything().filter((input) => typeof input !== "number"),
            { minLength: 1 }
          ),
          (input) => {
            expect(castNums(input)).toStrictEqual({
              status: "failure",
              expected: "array",
              items: input.map((actual) => ({
                status: "failure",
                expected: "number",
                actual
              })),
              actual: input
            });
          }
        )
      );
    });

    it("should fail to cast non-arrays", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => !Array.isArray(input)),
          (input) => {
            expect(castNums(input)).toStrictEqual({
              status: "failure",
              expected: "array",
              actual: input
            });
          }
        )
      );
    });
  });

  describe("tuple", () => {
    const castTriple = cast(tuple(string, number, boolean));

    it("should successfully cast triples", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.tuple(fc.string(), fc.double(), fc.boolean()),
          (input) => {
            expect(castTriple(input)).toStrictEqual({
              status: "success",
              values: [input]
            });
          }
        )
      );
    });

    it("should fail to cast invalid triples", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.tuple(
            fc.anything().filter((input) => typeof input !== "string"),
            fc.anything().filter((input) => typeof input !== "number"),
            fc.anything().filter((input) => typeof input !== "boolean")
          ),
          (input) => {
            const [first, second, third] = input;
            expect(castTriple(input)).toStrictEqual({
              status: "failure",
              expected: "tuple",
              length: 3,
              items: [
                { status: "failure", expected: "string", actual: first },
                { status: "failure", expected: "number", actual: second },
                { status: "failure", expected: "boolean", actual: third }
              ],
              actual: input
            });
          }
        )
      );
    });

    it("should fail to cast non-triples", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.tuple(fc.string(), fc.double()), (input) => {
          expect(castTriple(input)).toStrictEqual({
            status: "failure",
            expected: "tuple",
            length: 3,
            actual: input
          });
        })
      );
    });

    it("should fail to cast non-arrays", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => !Array.isArray(input)),
          (input) => {
            expect(castTriple(input)).toStrictEqual({
              status: "failure",
              expected: "tuple",
              length: 3,
              actual: input
            });
          }
        )
      );
    });
  });

  describe("record", () => {
    const castNumericRecord = cast(record(number));

    it("should successfully cast numeric records", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.double()), (input) => {
          expect(castNumericRecord(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should fail to cast non-numeric records", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.dictionary(
            fc.string(),
            fc.anything().filter((input) => typeof input !== "number"),
            { minKeys: 1 }
          ),
          (input) => {
            expect(castNumericRecord(input)).toStrictEqual({
              status: "failure",
              expected: "record",
              properties: Object.fromEntries(
                Object.entries(input).map(([key, actual]) => [
                  key,
                  { status: "failure", expected: "number", actual }
                ])
              ),
              actual: input
            });
          }
        )
      );
    });

    it("should fail to cast non-records", () => {
      expect.assertions(101);
      const property = (input: unknown) => {
        expect(castNumericRecord(input)).toStrictEqual({
          status: "failure",
          expected: "record",
          actual: input
        });
      };
      fc.assert(
        fc.property(
          fc.anything().filter((input) => typeof input !== "object"),
          property
        )
      );
      // eslint-disable-next-line unicorn/no-null -- testing null
      property(null);
    });
  });

  describe("object", () => {
    const castObject = cast(object({ foo: string, bar: number, baz: boolean }));

    it("should successfully cast objects", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.record({ foo: fc.string(), bar: fc.double(), baz: fc.boolean() }),
          (input) => {
            expect(castObject(input)).toStrictEqual({
              status: "success",
              values: [input]
            });
          }
        )
      );
    });

    it("should fail to cast invalid objects", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.record({
            foo: fc.anything().filter((input) => typeof input !== "string"),
            bar: fc.anything().filter((input) => typeof input !== "number")
          }),
          (input) => {
            const { foo, bar } = input;
            expect(castObject(input)).toStrictEqual({
              status: "failure",
              expected: "object",
              properties: {
                foo: { status: "failure", expected: "string", actual: foo },
                bar: { status: "failure", expected: "number", actual: bar },
                baz: {
                  status: "failure",
                  expected: "boolean",
                  actual: undefined
                }
              },
              actual: input
            });
          }
        )
      );
    });

    it("should fail to cast non-objects", () => {
      expect.assertions(101);
      const property = (input: unknown) => {
        expect(castObject(input)).toStrictEqual({
          status: "failure",
          expected: "object",
          actual: input
        });
      };
      fc.assert(
        fc.property(
          fc.anything().filter((input) => typeof input !== "object"),
          property
        )
      );
      // eslint-disable-next-line unicorn/no-null -- testing null
      property(null);
    });
  });

  describe("nullable", () => {
    const castNullableNumber = cast(nullable(number));

    it("should successfully cast numbers", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.double(), (input) => {
          expect(castNullableNumber(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should successfully cast null", () => {
      expect.assertions(1);
      // eslint-disable-next-line unicorn/no-null -- testing null
      const input = null;
      expect(castNullableNumber(input)).toStrictEqual({
        status: "success",
        values: [input]
      });
    });

    it("should fail to cast non-numbers and non-null", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc
            .anything()
            .filter((input) => typeof input !== "number")
            .filter((input) => input !== null),
          (input) => {
            expect(castNullableNumber(input)).toStrictEqual({
              status: "failure",
              expected: "union",
              variants: [
                { status: "failure", expected: "number", actual: input },
                { status: "failure", expected: "null", actual: input }
              ]
            });
          }
        )
      );
    });
  });

  describe("optional", () => {
    const castOptionalNumber = cast(optional(number));

    it("should successfully cast numbers", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.double(), (input) => {
          expect(castOptionalNumber(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should successfully cast undefined", () => {
      expect.assertions(1);
      const input = undefined;
      expect(castOptionalNumber(input)).toStrictEqual({
        status: "success",
        values: [input]
      });
    });

    it("should fail to cast non-numbers and non-undefined", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc
            .anything()
            .filter((input) => typeof input !== "number")
            .filter((input) => typeof input !== "undefined"),
          (input) => {
            expect(castOptionalNumber(input)).toStrictEqual({
              status: "failure",
              expected: "union",
              variants: [
                { status: "failure", expected: "number", actual: input },
                { status: "failure", expected: "undefined", actual: input }
              ]
            });
          }
        )
      );
    });
  });

  describe("enumeration", () => {
    const castGender = cast(enumeration("male", "female"));

    it("should successfully cast enumeration values", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.constantFrom("male", "female"), (input) => {
          expect(castGender(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should fail to cast non-enumeration values", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc
            .string()
            .filter((input) => input !== "male")
            .filter((input) => input !== "female"),
          (input) => {
            expect(castGender(input)).toStrictEqual({
              status: "failure",
              expected: "enumeration",
              values: new Set(["male", "female"]),
              actual: input
            });
          }
        )
      );
    });
  });

  describe("union", () => {
    const castFooBar = cast(
      union(object({ foo: string }), object({ bar: number }))
    );

    it("should successfully cast foo and bar", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.record({ foo: fc.string(), bar: fc.double() }),
          (input) => {
            const { foo, bar } = input;
            expect(castFooBar(input)).toStrictEqual({
              status: "success",
              values: [{ foo }, { bar }]
            });
          }
        )
      );
    });

    it("should successfully cast foo", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.record({ foo: fc.string() }), (input) => {
          expect(castFooBar(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should successfully cast bar", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.record({ bar: fc.double() }), (input) => {
          expect(castFooBar(input)).toStrictEqual({
            status: "success",
            values: [input]
          });
        })
      );
    });

    it("should fail to cast neither foo nor bar", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.record({ baz: fc.boolean() }), (input) => {
          expect(castFooBar(input)).toStrictEqual({
            status: "failure",
            expected: "union",
            variants: [
              {
                status: "failure",
                expected: "object",
                properties: {
                  foo: {
                    status: "failure",
                    expected: "string",
                    actual: undefined
                  }
                },
                actual: input
              },
              {
                status: "failure",
                expected: "object",
                properties: {
                  bar: {
                    status: "failure",
                    expected: "number",
                    actual: undefined
                  }
                },
                actual: input
              }
            ]
          });
        })
      );
    });
  });

  describe("intersection", () => {
    const castFooBar = cast(
      intersection(object({ foo: string }), object({ bar: number }))
    );

    it("should successfully cast foo and bar", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.record({ foo: fc.string(), bar: fc.double() }),
          (input) => {
            const { foo, bar } = input;
            expect(castFooBar(input)).toStrictEqual({
              status: "success",
              values: [[{ foo }, { bar }]]
            });
          }
        )
      );
    });

    it("should fail to cast neither foo nor bar", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.record({ baz: fc.boolean() }), (input) => {
          expect(castFooBar(input)).toStrictEqual({
            status: "failure",
            expected: "intersection",
            results: [
              {
                status: "failure",
                expected: "object",
                properties: {
                  foo: {
                    status: "failure",
                    expected: "string",
                    actual: undefined
                  }
                },
                actual: input
              },
              {
                status: "failure",
                expected: "object",
                properties: {
                  bar: {
                    status: "failure",
                    expected: "number",
                    actual: undefined
                  }
                },
                actual: input
              }
            ]
          });
        })
      );
    });
  });

  describe("pure", () => {
    const answer = 42;
    const castAnswer = cast(pure(answer));

    it("should always succeed with a constant answer", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.anything(), (input) => {
          expect(castAnswer(input)).toStrictEqual({
            status: "success",
            values: [answer]
          });
        })
      );
    });
  });

  describe("map", () => {
    const castLength = cast(map((s) => s.length, string));

    it("should successfully cast strings to length", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(fc.string(), (input) => {
          expect(castLength(input)).toStrictEqual({
            status: "success",
            values: [input.length]
          });
        })
      );
    });

    it("should fail to cast non-strings", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.anything().filter((input) => typeof input !== "string"),
          (input) => {
            expect(castLength(input)).toStrictEqual({
              status: "failure",
              expected: "string",
              actual: input
            });
          }
        )
      );
    });
  });

  describe("fix", () => {
    type List<A> = Cons<A> | null;

    interface Cons<A> {
      head: A;
      tail: List<A>;
    }

    const list = <A>(type: Type<A>) =>
      fix<List<A>>((tail) => nullable(object({ head: type, tail })));

    const castNums = cast(list(number));

    it("should successfully cast recursive data structures", () => {
      expect.assertions(100);
      fc.assert(
        fc.property(
          fc.letrec<{ list: List<number>; cons: Cons<number> }>((tie) => ({
            list: fc.option(tie("cons")),
            cons: fc.record({ head: fc.double(), tail: tie("list") })
          })).list,
          (input) => {
            expect(castNums(input)).toStrictEqual({
              status: "success",
              values: [input]
            });
          }
        )
      );
    });
  });
});
