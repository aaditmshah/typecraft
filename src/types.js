const unknown = { tag: "unknown" };
const never = { tag: "never" };
const string = { tag: "string" };
const number = { tag: "number" };
const bigint = { tag: "bigint" };
const boolean = { tag: "boolean" };
const symbol = { tag: "symbol" };
const array = (type) => ({ tag: "array", type });
const tuple = (...types) => ({ tag: "tuple", types });
const record = (type) => ({ tag: "record", type });
const object = (propTypes) => ({ tag: "object", propTypes });
const nullable = (type) => ({ tag: "nullable", type });
const optional = (type) => ({ tag: "optional", type });
const enumeration = (...values) => ({ tag: "enumeration", values });
const union = (...types) => ({ tag: "union", types });
const intersection = (...types) => ({ tag: "intersection", types });
const pure = (value) => ({ tag: "pure", value });
const map = (morphism, type) => ({ tag: "map", morphism, type });
const fix = (combinators) => {
  const propTypes = Object.fromEntries(
    Object.keys(combinators).map((key) => [
      key,
      { tag: "reference", symbol: Symbol(key) }
    ])
  );
  const context = Object.fromEntries(
    Object.entries(combinators).map(([key, combinator]) => [
      propTypes[key].symbol,
      combinator(propTypes)
    ])
  );
  return Object.fromEntries(
    Object.keys(combinators).map((key) => [
      key,
      { tag: "recursive", symbol: propTypes[key].symbol, context }
    ])
  );
};

export {
  unknown,
  never,
  string,
  number,
  bigint,
  boolean,
  symbol,
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
