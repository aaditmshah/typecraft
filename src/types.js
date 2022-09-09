const unknown = { tag: "unknown" };
const never = { tag: "never" };
const primitive = (type) => ({ tag: "primitive", type });
const string = primitive("string");
const number = primitive("number");
const bigint = primitive("bigint");
const boolean = primitive("boolean");
const symbol = primitive("symbol");
const array = (type) => ({ tag: "array", type });
const tuple = (...types) => ({ tag: "tuple", types });
const record = (type) => ({ tag: "record", type });
const object = (propTypes) => ({ tag: "object", propTypes });
const enumeration = (...values) => ({
  tag: "enumeration",
  values: new Set(values)
});
const union = (...types) => ({ tag: "union", types });
const nullable = (type) => union(type, primitive("null"));
const optional = (type) => union(type, primitive("undefined"));
const intersection = (...types) => ({ tag: "intersection", types });
const pure = (value) => ({ tag: "pure", value });
const map = (morphism, type) => ({ tag: "map", morphism, type });
const fix = (combinator) => {
  const type = combinator({ tag: "lazy", getType: () => type });
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
  fix
};
