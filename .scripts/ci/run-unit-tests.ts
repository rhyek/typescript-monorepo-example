import { findChangedPackages } from './common/find-changed-packages';
import { pnpmExec, pnpmRun } from './common/pnpm-helpers';

async function main() {
  const libs = await findChangedPackages([
    { parentDir: 'shared' },
    { parentDir: 'apps', includeDependencies: true, excludeSelf: true },
  ]);
  await pnpmExec(['pnpx', 'ttsc', '-b', 'tsconfig.build.json'], libs);
  const all = await findChangedPackages([
    {
      parentDir: 'shared',
    },
    {
      parentDir: 'shared',
      includeDependents: true,
      diffExclusions: [/.\.spec\.ts/],
    },
    { parentDir: 'apps' },
  ]);
  await pnpmRun('test:unit', all);
}

main();
