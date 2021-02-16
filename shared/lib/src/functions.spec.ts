import { makeMessage } from 'src/functions';

describe('functions', () => {
  it('returns process.env.MSG', () => {
    process.env.MSG = 'Hello World!';
    expect(makeMessage()).toBe('HELLO WORLD! :-)');
  });
});
