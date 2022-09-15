// eslint-disable-next-line unicorn/no-null -- empty list
const nil = () => null;

const cons = (head, tail) => ({ head, tail });

const reverse = (list) => {
  let result = nil();
  for (let variant = list; variant !== null; variant = variant.tail) {
    result = cons(variant.head, result);
  }
  return result;
};

const feed = (pipe) => (value) => {
  let result = value;
  for (let variant = pipe; variant !== null; variant = variant.tail) {
    result = variant.head(result);
  }
  return result;
};

const apply = (composition) => feed(reverse(composition));

export {
  nil as tap,
  nil,
  cons as pipe,
  cons,
  reverse as backwards,
  reverse,
  feed,
  apply
};
