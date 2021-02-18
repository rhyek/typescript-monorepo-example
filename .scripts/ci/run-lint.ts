import { findChangedPackages } from './common/find-changed-packages';
import { pnpmRun } from './common/pnpm-helpers';

export async function main() {
  const all = await findChangedPackages([
    { parentDir: 'shared' },
    { parentDir: 'apps' },
  ]);
  await pnpmRun('lint', all);
}

if (require.main === module) {
  main();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
