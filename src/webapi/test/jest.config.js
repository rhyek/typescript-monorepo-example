const base = require('../jest.config');

module.exports = {
  ...base,
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
};
