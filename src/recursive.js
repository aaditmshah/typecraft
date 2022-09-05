const recursive = (context, environment, inputType) => {
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
      return { type: { tag: "array", type }, free };
    }
    case "tuple": {
      const { types, free } = concat(context, environment, inputType.types);
      return { type: { tag: "tuple", types }, free };
    }
    case "record": {
      const { type, free } = recursive(context, environment, inputType.type);
      return { type: { tag: "record", type }, free };
    }
    case "object": {
      const { types, free } = concat(context, environment, inputType.propTypes);
      return { type: { tag: "object", propTypes: types }, free };
    }
    case "nullable": {
      const { type, free } = recursive(context, environment, inputType.type);
      return { type: { tag: "nullable", type }, free };
    }
    case "optional": {
      const { type, free } = recursive(context, environment, inputType.type);
      return { type: { tag: "optional", type }, free };
    }
    case "enumeration":
      return { type: inputType, free: new Set() };
    case "union": {
      const { types, free } = concat(context, environment, inputType.types);
      return { type: { tag: "union", types }, free };
    }
    case "intersection": {
      const { types, free } = concat(context, environment, inputType.types);
      return { type: { tag: "intersection", types }, free };
    }
    case "pure":
      return { type: inputType, free: new Set() };
    case "map": {
      const { type, free } = recursive(context, environment, inputType.type);
      return { type: { tag: "map", morphism: inputType.morphism, type }, free };
    }
    case "reference": {
      const { symbol } = inputType;
      if (!Object.hasOwn(context, symbol) || environment.has(symbol))
        return { type: inputType, free: new Set([symbol]) };
      const extended = new Set([...environment, symbol]);
      const { type, free } = recursive(context, extended, context[symbol]);
      if (!free.has(symbol)) return { type, free };
      const set = new Set([...free].filter((name) => name !== symbol));
      return { type: { tag: "recursive", symbol, type }, free: set };
    }
    case "recursive": {
      const { symbol } = inputType;
      const extended = new Set([...environment, symbol]);
      const { type, free } = recursive(context, extended, inputType.type);
      return { type: { tag: "recursive", symbol, type }, free };
    }
    default:
      throw new TypeError(`unknown type ${inputType}`);
  }
};

function concat(context, environment, inputTypes) {
  const set = new Set();
  const types = inputTypes.map((inputType) => {
    const { type, free } = recursive(context, environment, inputType);
    for (const symbol of free) set.add(symbol);
    return type;
  });
  return { types, free: set };
}

export { recursive };
