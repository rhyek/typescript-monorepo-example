import { makeMessage } from 'src/functions';

describe('functions', () => {
  it('returns the correct string', () => {
    expect(makeMessage()).toBe('Hello World!');
  });
});
