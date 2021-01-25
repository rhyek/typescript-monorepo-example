import { makeMessage } from './functions';

describe('functions', () => {
  it('returns a string', () => {
    expect(makeMessage()).toBe('Hello World!');
  });
});
