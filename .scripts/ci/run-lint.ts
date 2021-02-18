import { findChangedPackages } from './common/find-changed-packages';
import { pnpmRun } from './common/pnpm-helpers';

async function main() {
  const all = await findChangedPackages([
    { parentDir: 'shared' },
    { parentDir: 'apps' },
  ]);
  await pnpmRun('lint', all);
}

main();

process.on('unhandledRejection', (error) => {
  throw error;
});
