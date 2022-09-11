// eslint-disable-next-line strict, unicorn/prefer-module, import/unambiguous -- config file
"use strict";

// eslint-disable-next-line unicorn/prefer-module, import/no-commonjs -- config file
module.exports = {
  rootDir: "./src/",
  coverageThreshold: {
    global: { statements: 100, branches: 100, functions: 100, lines: 100 }
  }
};
