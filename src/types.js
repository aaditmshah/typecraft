import { id, compose } from "type-aligned";

const unknown = { tag: "unknown", composition: id() };
const never = { tag: "never", composition: id() };
const primitive = (type) => ({ tag: "primitive", type, composition: id() });
const string = primitive("string");
const number = primitive("number");
const bigint = primitive("bigint");
const boolean = primitive("boolean");
const symbol = primitive("symbol");
const array = (type) => ({ tag: "array", type, composition: id() });
const tuple = (...types) => ({ tag: "tuple", types, composition: id() });
const record = (type) => ({ tag: "record", type, composition: id() });
const object = (propTypes) => ({
  tag: "object",
  propTypes,
  composition: id(),
});
const enumeration = (...values) => ({
  tag: "enumeration",
  values: new Set(values),
  composition: id(),
});
const union = (...types) => ({ tag: "union", types, composition: id() });
const nullable = (type) => union(type, primitive("null"));
const optional = (type) => union(type, primitive("undefined"));
const intersection = (...types) => ({
  tag: "intersection",
  types,
  composition: id(),
});
const pure = (value) => ({ tag: "pure", value, composition: id() });
const map = (morphism, type) => ({
  ...type,
  composition: compose(morphism, type.composition),
});
const fix = (combinator) => {
  const type = combinator({
    tag: "lazy",
    getType: () => type,
    composition: id(),
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
