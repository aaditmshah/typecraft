// eslint-disable-next-line unicorn/no-null -- empty pipeline
const tap = () => null;

const pipe = (morphism, pipeline) => ({ morphism, pipeline });

const feed = (pipeline) => (value) => {
  let result = value;
  for (let list = pipeline; list !== null; list = list.pipeline) {
    result = list.morphism(result);
  }
  return result;
};

export { tap, pipe, feed };
