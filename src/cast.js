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
      return (actual) => ({ status: "success", values: [actual] });
    case "never":
      return (actual) => ({ status: "failure", expected: "never", actual });
    case "primitive": {
      const { type } = inputType;
      switch (type) {
        case "string":
          return (actual) =>
            typeof actual === "string"
              ? { status: "success", values: [actual] }
              : { status: "failure", expected: "string", actual };
        case "number":
          return (actual) =>
            typeof actual === "number"
              ? { status: "success", values: [actual] }
              : { status: "failure", expected: "number", actual };
        case "bigint":
          return (actual) =>
            typeof actual === "bigint"
              ? { status: "success", values: [actual] }
              : { status: "failure", expected: "bigint", actual };
        case "boolean":
          return (actual) =>
            typeof actual === "boolean"
              ? { status: "success", values: [actual] }
              : { status: "failure", expected: "boolean", actual };
        case "symbol":
          return (actual) =>
            typeof actual === "symbol"
              ? { status: "success", values: [actual] }
              : { status: "failure", expected: "symbol", actual };
        case "null":
          return (actual) =>
            actual === null
              ? { status: "success", values: [actual] }
              : { status: "failure", expected: "null", actual };
        case "undefined":
          return (actual) =>
            typeof actual === "undefined"
              ? { status: "success", values: [actual] }
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
        return items.some((item) => item.status !== "success")
          ? { status: "failure", expected: "array", items, actual }
          : {
              status: "success",
              values: nondet(items.map((item) => item.values))
            };
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
        return items.some((item) => item.status !== "success")
          ? { status: "failure", expected: "tuple", length, items, actual }
          : {
              status: "success",
              values: nondet(items.map((item) => item.values))
            };
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
      };
    }
    case "enumeration": {
      const { values } = inputType;
      return (actual) =>
        values.has(actual)
          ? { status: "success", values: [actual] }
          : { status: "failure", expected: "enumeration", values, actual };
    }
    case "union": {
      const castTypes = inputType.types.map((type) => cast(type));
      return (actual) => {
        const variants = castTypes.map((castType) => castType(actual));
        const successes = variants.filter(
          (variant) => variant.status === "success"
        );
        return successes.length > 0
          ? {
              status: "success",
              values: successes.flatMap((variant) => variant.values)
            }
          : { status: "failure", expected: "union", variants };
      };
    }
    case "intersection": {
      const castTypes = inputType.types.map((type) => cast(type));
      return (actual) => {
        const results = castTypes.map((castType) => castType(actual));
        return results.some((result) => result.status !== "success")
          ? { status: "failure", expected: "intersection", results }
          : {
              status: "success",
              values: nondet(results.map((result) => result.values))
            };
      };
    }
    case "pure": {
      const { value } = inputType;
      return (_actual) => ({ status: "success", values: [value] });
    }
    case "map": {
      const { morphism, type } = inputType;
      const castType = cast(type);
      return (actual) => {
        const result = castType(actual);
        return result.status === "success"
          ? {
              status: "success",
              values: result.values.map((value) => morphism(value))
            }
          : result;
      };
    }
    case "lazy": {
      const { getType } = inputType;
      return (actual) => cast(getType())(actual);
    }
    /* istanbul ignore next */
    default:
      throw new TypeError(`unknown type ${inputType}`);
  }
};

export { cast };
