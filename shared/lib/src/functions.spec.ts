import { capitalize } from 'src/functions';

describe('functions', () => {
  it('can capitalize', () => {
    expect(capitalize('hello')).toBe('HELLO');
  });
});
