import { nil, cons } from "./pipe";

const unknown = { tag: "unknown", composition: nil() };
const never = { tag: "never", composition: nil() };
const primitive = (type) => ({ tag: "primitive", type, composition: nil() });
const string = primitive("string");
const number = primitive("number");
const bigint = primitive("bigint");
const boolean = primitive("boolean");
const symbol = primitive("symbol");
const array = (type) => ({ tag: "array", type, composition: nil() });
const tuple = (...types) => ({ tag: "tuple", types, composition: nil() });
const record = (type) => ({ tag: "record", type, composition: nil() });
const object = (propTypes) => ({
  tag: "object",
  propTypes,
  composition: nil(),
});
const enumeration = (...values) => ({
  tag: "enumeration",
  values: new Set(values),
  composition: nil(),
});
const union = (...types) => ({ tag: "union", types, composition: nil() });
const nullable = (type) => union(type, primitive("null"));
const optional = (type) => union(type, primitive("undefined"));
const intersection = (...types) => ({
  tag: "intersection",
  types,
  composition: nil(),
});
const pure = (value) => ({ tag: "pure", value, composition: nil() });
const map = (morphism, type) => ({
  ...type,
  composition: cons(morphism, type.composition),
});
const fix = (combinator) => {
  const type = combinator({
    tag: "lazy",
    getType: () => type,
    composition: nil(),
  });
  return type;
};

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
