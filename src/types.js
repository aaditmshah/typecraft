const add = (set, item) => new Set([...set, item]);
const remove = (set, item) => new Set([...set].filter((data) => data !== item));

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
const reference = (name) => ({ tag: "reference", symbol: name });
const recursive = (name, type) => ({ tag: "recursive", symbol: name, type });
const fix = (combinators) => {
  const propTypes = Object.fromEntries(
    Object.keys(combinators).map((key) => [key, reference(Symbol(key))])
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
      spin(context, new Set(), propTypes[key]).type
    ])
  );
};

function spin(context, environment, inputType) {
  switch (inputType.tag) {
    case "unknown":
    case "never":
    case "primitive":
    case "enumeration":
    case "pure":
      return { type: inputType, free: new Set() };
    case "array": {
      const { type, free } = spin(context, environment, inputType.type);
      return { type: array(type), free };
    }
    case "tuple": {
      const { types, free } = spinAll(context, environment, inputType.types);
      return { type: tuple(...types), free };
    }
    case "record": {
      const { type, free } = spin(context, environment, inputType.type);
      return { type: record(type), free };
    }
    case "object": {
      const set = new Set();
      const propTypes = Object.fromEntries(
        Object.entries(inputType.propTypes).map(([key, propertyType]) => {
          const { type, free } = spin(context, environment, propertyType);
          for (const name of free) set.add(name);
          return [key, type];
        })
      );
      return { type: object(propTypes), free: set };
    }
    case "union": {
      const { types, free } = spinAll(context, environment, inputType.types);
      return { type: union(...types), free };
    }
    case "intersection": {
      const { types, free } = spinAll(context, environment, inputType.types);
      return { type: intersection(...types), free };
    }
    case "map": {
      const { type, free } = spin(context, environment, inputType.type);
      return { type: map(inputType.morphism, type), free };
    }
    case "reference": {
      const name = inputType.symbol;
      return Object.hasOwn(context, name) && !environment.has(name)
        ? spin(context, environment, recursive(name, context[name]))
        : { type: inputType, free: new Set([name]) };
    }
    case "recursive": {
      const name = inputType.symbol;
      const result = spin(context, add(environment, name), inputType.type);
      const { type, free } = result;
      return free.has(name)
        ? { type: recursive(name, type), free: remove(free, name) }
        : result;
    }
    /* istanbul ignore next */
    default:
      throw new TypeError(`unknown type ${inputType}`);
  }
}

function spinAll(context, environment, inputTypes) {
  const set = new Set();
  const types = inputTypes.map((inputType) => {
    const { type, free } = spin(context, environment, inputType);
    for (const name of free) set.add(name);
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
