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
      recursive(context, new Set(), propTypes[key]).type
    ])
  );
};

function recursive(context, environment, inputType) {
  switch (inputType.tag) {
    case "unknown":
    case "never":
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "symbol":
      return { type: inputType, free: new Set() };
    case "array": {
      const { type, free } = recursive(context, environment, inputType.type);
      return { type: array(type), free };
    }
    case "tuple": {
      const { types, free } = concat(context, environment, inputType.types);
      return { type: tuple(types), free };
    }
    case "record": {
      const { type, free } = recursive(context, environment, inputType.type);
      return { type: record(type), free };
    }
    case "object": {
      const { types, free } = concat(context, environment, inputType.propTypes);
      return { type: object(types), free };
    }
    case "nullable": {
      const { type, free } = recursive(context, environment, inputType.type);
      return { type: nullable(type), free };
    }
    case "optional": {
      const { type, free } = recursive(context, environment, inputType.type);
      return { type: optional(type), free };
    }
    case "enumeration":
      return { type: inputType, free: new Set() };
    case "union": {
      const { types, free } = concat(context, environment, inputType.types);
      return { type: union(types), free };
    }
    case "intersection": {
      const { types, free } = concat(context, environment, inputType.types);
      return { type: intersection(types), free };
    }
    case "pure":
      return { type: inputType, free: new Set() };
    case "map": {
      const { type, free } = recursive(context, environment, inputType.type);
      return { type: map(inputType.morphism, type), free };
    }
    case "reference": {
      const reference = inputType.symbol;
      if (!Object.hasOwn(context, reference) || environment.has(reference))
        return { type: inputType, free: new Set([reference]) };
      const extended = new Set([...environment, reference]);
      const { type, free } = recursive(context, extended, context[reference]);
      if (!free.has(reference)) return { type, free };
      const set = new Set([...free].filter((name) => name !== reference));
      return { type: { tag: "recursive", symbol: reference, type }, free: set };
    }
    case "recursive": {
      const reference = inputType.symbol;
      const extended = new Set([...environment, reference]);
      const { type, free } = recursive(context, extended, inputType.type);
      return { type: { tag: "recursive", symbol: reference, type }, free };
    }
    default:
      throw new TypeError(`unknown type ${inputType}`);
  }
}

function concat(context, environment, inputTypes) {
  const set = new Set();
  const types = inputTypes.map((inputType) => {
    const { type, free } = recursive(context, environment, inputType);
    for (const reference of free) set.add(reference);
    return type;
  });
  return { types, free: set };
}

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
