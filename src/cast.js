const nondet = (arrays) => {
  if (arrays.length === 0) return [[]];
  const [xs, ...xss] = arrays;
  const yss = nondet(xss);
  return xs.flatMap((x) => yss.map((ys) => [x, ...ys]));
};

const nondetObject = (arrays) => {
  if (arrays.length === 0) return [[]];
  const [[key, xs], ...xss] = arrays;
  const objects = nondetObject(xss);
  return xs.flatMap((x) => objects.map((object) => ({ [key]: x, ...object })));
};

const castType = (context, inputType, actual) => {
  switch (inputType.tag) {
    case "unknown":
      return { status: "success", values: [actual] };
    case "never":
      return { status: "failure", expected: "never", actual };
    case "primitive": {
      const { type } = inputType;
      switch (type) {
        case "string":
          return typeof actual === "string"
            ? { status: "success", values: [actual] }
            : { status: "failure", expected: "string", actual };
        case "number":
          return typeof actual === "number"
            ? { status: "success", values: [actual] }
            : { status: "failure", expected: "number", actual };
        case "bigint":
          return typeof actual === "bigint"
            ? { status: "success", values: [actual] }
            : { status: "failure", expected: "bigint", actual };
        case "boolean":
          return typeof actual === "boolean"
            ? { status: "success", values: [actual] }
            : { status: "failure", expected: "boolean", actual };
        case "symbol":
          return typeof actual === "symbol"
            ? { status: "success", values: [actual] }
            : { status: "failure", expected: "symbol", actual };
        case "null":
          return actual === null
            ? { status: "success", values: [actual] }
            : { status: "failure", expected: "null", actual };
        case "undefined":
          return typeof actual === "undefined"
            ? { status: "success", values: [actual] }
            : { status: "failure", expected: "undefined", actual };
        default:
          throw new TypeError(`invalid primitive ${type}`);
      }
    }
    case "array": {
      if (!Array.isArray(actual))
        return { status: "failure", expected: "array", actual };
      const items = actual.map((item) =>
        castType(context, inputType.type, item)
      );
      return items.some((item) => item.status !== "success")
        ? { status: "failure", expected: "array", items, actual }
        : {
            status: "success",
            values: nondet(items.map((item) => item.values))
          };
    }
    case "tuple": {
      const { types } = inputType;
      const { length } = types;
      if (!Array.isArray(actual) || actual.length !== length)
        return { status: "failure", expected: "tuple", length, actual };
      const items = types.map((type, index) =>
        castType(context, type, actual[index])
      );
      return items.some((item) => item.status !== "success")
        ? { status: "failure", expected: "tuple", length, items, actual }
        : {
            status: "success",
            values: nondet(items.map((item) => item.values))
          };
    }
    case "record": {
      if (typeof actual !== "object" || actual === null)
        return { status: "failure", expected: "record", actual };
      const properties = Object.entries(actual).map(([key, value]) => [
        key,
        castType(context, inputType.type, value)
      ]);
      return properties.some(([_, result]) => result.status !== "success")
        ? {
            status: "failure",
            expected: "record",
            properties: Object.fromEntries(properties),
            actual
          }
        : {
            status: "success",
            values: nondetObject(
              properties.map(([key, result]) => [key, result.values])
            )
          };
    }
    case "object": {
      if (typeof actual !== "object" || actual === null)
        return { status: "failure", expected: "object", actual };
      const properties = Object.entries(inputType.propTypes).map(
        ([key, propertyType]) => [
          key,
          castType(
            context,
            propertyType,
            Object.hasOwn(actual, key) ? actual[key] : undefined
          )
        ]
      );
      return properties.some(([_, result]) => result.status !== "success")
        ? {
            status: "failure",
            expected: "object",
            properties: Object.fromEntries(properties),
            actual
          }
        : {
            status: "success",
            values: nondetObject(
              properties.map(([key, result]) => [key, result.values])
            )
          };
    }
    case "enumeration": {
      const { values } = inputType;
      return values.has(actual)
        ? { status: "success", values: [actual] }
        : { status: "failure", expected: "enumeration", values, actual };
    }
    case "union": {
      const variants = inputType.types.map((type) =>
        castType(context, type, actual)
      );
      const successes = variants.filter(
        (variant) => variant.status === "success"
      );
      return successes.length > 0
        ? {
            status: "success",
            values: successes.flatMap((variant) => variant.values)
          }
        : { status: "failure", expected: "union", variants };
    }
    case "intersection": {
      const results = inputType.types.map((type) =>
        castType(context, type, actual)
      );
      return results.some((result) => result.status !== "success")
        ? { status: "failure", expected: "intersection", results }
        : {
            status: "success",
            values: nondet(results.map((result) => result.values))
          };
    }
    case "pure":
      return { status: "success", values: [inputType.value] };
    case "map": {
      const { morphism, type } = inputType;
      const result = castType(context, type, actual);
      return result.status === "success"
        ? {
            status: "success",
            values: result.values.map((value) => morphism(value))
          }
        : result;
    }
    case "reference": {
      const { symbol } = inputType;
      return Object.hasOwn(context, symbol)
        ? castType(context, context[symbol], actual)
        : { status: "unbound", symbol };
    }
    case "recursive": {
      const { symbol, type } = inputType;
      return castType({ ...context, [symbol]: type }, type, actual);
    }
    default:
      throw new TypeError(`unknown type ${inputType}`);
  }
};

const cast = (type) => (input) => castType({}, type, input);

export { cast };
