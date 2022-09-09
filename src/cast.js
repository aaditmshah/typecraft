const nondet = (arrays) => {
  if (arrays.length === 0) return [[]];
  const [xs, ...xss] = arrays;
  const yss = nondet(xss);
  return xs.flatMap((x) => yss.map((ys) => [x, ...ys]));
};

const nondetObject = (arrays) => {
  if (arrays.length === 0) return [{}];
  const [[key, xs], ...xss] = arrays;
  const objects = nondetObject(xss);
  return xs.flatMap((x) => objects.map((object) => ({ [key]: x, ...object })));
};

const cast = (inputType) => {
  switch (inputType.tag) {
    case "unknown":
      return (actual) => ({ status: "success", value: actual, values: [] });
    case "never":
      return (actual) => ({ status: "failure", expected: "never", actual });
    case "primitive": {
      const { type } = inputType;
      switch (type) {
        case "string":
          return (actual) =>
            typeof actual === "string"
              ? { status: "success", value: actual, values: [] }
              : { status: "failure", expected: "string", actual };
        case "number":
          return (actual) =>
            typeof actual === "number"
              ? { status: "success", value: actual, values: [] }
              : { status: "failure", expected: "number", actual };
        case "bigint":
          return (actual) =>
            typeof actual === "bigint"
              ? { status: "success", value: actual, values: [] }
              : { status: "failure", expected: "bigint", actual };
        case "boolean":
          return (actual) =>
            typeof actual === "boolean"
              ? { status: "success", value: actual, values: [] }
              : { status: "failure", expected: "boolean", actual };
        case "symbol":
          return (actual) =>
            typeof actual === "symbol"
              ? { status: "success", value: actual, values: [] }
              : { status: "failure", expected: "symbol", actual };
        case "null":
          return (actual) =>
            actual === null
              ? { status: "success", value: actual, values: [] }
              : { status: "failure", expected: "null", actual };
        case "undefined":
          return (actual) =>
            typeof actual === "undefined"
              ? { status: "success", value: actual, values: [] }
              : { status: "failure", expected: "undefined", actual };
        /* istanbul ignore next */
        default:
          throw new TypeError(`invalid primitive ${type}`);
      }
    }
    case "array": {
      const castType = cast(inputType.type);
      return (actual) => {
        if (!Array.isArray(actual))
          return { status: "failure", expected: "array", actual };
        const items = actual.map((item) => castType(item));
        if (items.some((item) => item.status !== "success"))
          return { status: "failure", expected: "array", items, actual };
        const [value, ...values] = nondet(
          items.map((item) => [item.value, ...item.values])
        );
        return { status: "success", value, values };
      };
    }
    case "tuple": {
      const { types } = inputType;
      const { length } = types;
      const castTypes = types.map((type) => cast(type));
      return (actual) => {
        if (!Array.isArray(actual) || actual.length !== length)
          return { status: "failure", expected: "tuple", length, actual };
        const items = castTypes.map((castType, index) =>
          castType(actual[index])
        );
        if (items.some((item) => item.status !== "success")) {
          return {
            status: "failure",
            expected: "tuple",
            length,
            items,
            actual
          };
        }
        const [value, ...values] = nondet(
          items.map((item) => [item.value, ...item.values])
        );
        return { status: "success", value, values };
      };
    }
    case "record": {
      const castType = cast(inputType.type);
      return (actual) => {
        if (typeof actual !== "object" || actual === null)
          return { status: "failure", expected: "record", actual };
        const properties = Object.entries(actual).map(([key, value]) => [
          key,
          castType(value)
        ]);
        if (properties.some(([_, result]) => result.status !== "success")) {
          return {
            status: "failure",
            expected: "record",
            properties: Object.fromEntries(properties),
            actual
          };
        }
        const [value, ...values] = nondetObject(
          properties.map(([key, result]) => [
            key,
            [result.value, ...result.values]
          ])
        );
        return { status: "success", value, values };
      };
    }
    case "object": {
      const castPropertyTypes = Object.entries(inputType.propTypes).map(
        ([key, propertyType]) => [key, cast(propertyType)]
      );
      return (actual) => {
        if (typeof actual !== "object" || actual === null)
          return { status: "failure", expected: "object", actual };
        const properties = castPropertyTypes.map(([key, castType]) => [
          key,
          castType(Object.hasOwn(actual, key) ? actual[key] : undefined)
        ]);
        if (properties.some(([_, result]) => result.status !== "success")) {
          return {
            status: "failure",
            expected: "object",
            properties: Object.fromEntries(properties),
            actual
          };
        }
        const [value, ...values] = nondetObject(
          properties.map(([key, result]) => [
            key,
            [result.value, ...result.values]
          ])
        );
        return { status: "success", value, values };
      };
    }
    case "enumeration": {
      const { values } = inputType;
      return (actual) =>
        values.has(actual)
          ? { status: "success", value: actual, values: [] }
          : { status: "failure", expected: "enumeration", values, actual };
    }
    case "union": {
      const castTypes = inputType.types.map((type) => cast(type));
      return (actual) => {
        const variants = castTypes.map((castType) => castType(actual));
        const successes = variants.filter(
          (variant) => variant.status === "success"
        );
        if (successes.length === 0)
          return { status: "failure", expected: "union", variants };
        const [value, ...values] = successes.flatMap((variant) => [
          variant.value,
          ...variant.values
        ]);
        return { status: "success", value, values };
      };
    }
    case "intersection": {
      const castTypes = inputType.types.map((type) => cast(type));
      return (actual) => {
        const results = castTypes.map((castType) => castType(actual));
        if (results.some((result) => result.status !== "success"))
          return { status: "failure", expected: "intersection", results };
        const [value, ...values] = nondet(
          results.map((result) => [result.value, ...result.values])
        );
        return { status: "success", value, values };
      };
    }
    case "pure": {
      const { value } = inputType;
      return (_actual) => ({ status: "success", value, values: [] });
    }
    case "map": {
      const { morphism, type } = inputType;
      const castType = cast(type);
      return (actual) => {
        const result = castType(actual);
        return result.status === "success"
          ? {
              status: "success",
              value: morphism(result.value),
              values: result.values.map(
                /* istanbul ignore next */ (value) => morphism(value)
              )
            }
          : result;
      };
    }
    case "lazy": {
      const type = inputType.getType();
      return (actual) => cast(type)(actual);
    }
    /* istanbul ignore next */
    default:
      throw new TypeError(`unknown type ${inputType}`);
  }
};

export { cast };
