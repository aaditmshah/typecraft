const recursive = (context, environment, type) => {
  switch (type.tag) {
    case "unknown":
    case "never":
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "symbol":
      return { type, free: new Set() };
    case "array": {
      const result = recursive(context, environment, type.type);
      return { type: { tag: "array", type: result.type }, free: result.free };
    }
    case "tuple": {
      const types = [];
      const free = new Set();
      for (const itemType of type.types) {
        const result = recursive(context, environment, itemType);
        types.push(result.type);
        for (const symbol of result.free) free.add(symbol);
      }
      return { type: { tag: "tuple", types }, free };
    }
    case "record": {
      const result = recursive(context, environment, type.type);
      return { type: { tag: "record", type: result.type }, free: result.free };
    }
    case "object": {
      const propTypes = {};
      const free = new Set();
      for (const [key, propertyType] of Object.entries(type.propTypes)) {
        const result = recursive(context, environment, propertyType);
        propTypes[key] = result.type;
        for (const symbol of result.free) free.add(symbol);
      }
      return { type: { tag: "object", propTypes }, free };
    }
    case "nullable": {
      const result = recursive(context, environment, type.type);
      return {
        type: { tag: "nullable", type: result.type },
        free: result.free
      };
    }
    case "optional": {
      const result = recursive(context, environment, type.type);
      return {
        type: { tag: "optional", type: result.type },
        free: result.free
      };
    }
    case "enumeration":
      return { type, free: new Set() };
    case "union": {
      const types = [];
      const free = new Set();
      for (const unionType of type.types) {
        const result = recursive(context, environment, unionType);
        types.push(result.type);
        for (const symbol of result.free) free.add(symbol);
      }
      return { type: { tag: "union", types }, free };
    }
    case "intersection": {
      const types = [];
      const free = new Set();
      for (const intersectionType of type.types) {
        const result = recursive(context, environment, intersectionType);
        types.push(result.type);
        for (const symbol of result.free) free.add(symbol);
      }
      return { type: { tag: "intersection", types }, free };
    }
    case "pure":
      return { type, free: new Set() };
    case "map": {
      const result = recursive(context, environment, type.type);
      return {
        type: { tag: "map", morphism: type.morphism, type: result.type },
        free: result.free
      };
    }
    case "reference": {
      const { symbol } = type;
      if (!Object.hasOwn(context, symbol) || environment.has(symbol)) {
        return { type, free: new Set([symbol]) };
      }
      const result = recursive(
        context,
        new Set([...environment, symbol]),
        context[symbol]
      );
      const { free } = result;
      if (!free.has(symbol)) return result;
      free.delete(symbol);
      return { type: { tag: "recursive", symbol, type: result.type }, free };
    }
    case "recursive": {
      const { symbol } = type;
      const result = recursive(
        context,
        new Set([...environment, symbol]),
        type.type
      );
      return {
        type: { tag: "recursive", symbol, type: result.type },
        free: result.free
      };
    }
    default:
      throw new TypeError(`unknown type ${type}`);
  }
};

export { recursive };
