import { tap, pipe, feed } from "./pipeline";

// eslint-disable-next-line unicorn/no-null -- empty composition
const id = () => null;

const compose = (morphism, composition) => ({ morphism, composition });

const assoc = (composition) => {
  let result = tap();
  for (let list = composition; list !== null; list = list.composition) {
    result = pipe(list.morphism, result);
  }
  return result;
};

const apply = (composition) => feed(assoc(composition));

export { id, compose, assoc, apply };
