const merge = require('deepmerge');
const base = require('../jest.config');

module.exports = {
  ...merge(base, {
    globals: {
      'ts-jest': {
        tsconfig: '../tsconfig.test.json',
      },
    },
  }),
  rootDir: '.',
  testRegex: [/.*\.e2e-spec\.ts$/],
};
