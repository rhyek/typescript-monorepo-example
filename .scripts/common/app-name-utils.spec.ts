import { getAppNameForDir } from './app-name-utils';

describe('get app name utils', () => {
  it('from dir', () => {
    expect(getAppNameForDir('/monorepo/apps/some-app')).toEqual('some-app');
  });
});
