#!/usr/bin/env ts-node-transpile-only
import { findChangedPackages } from './common/find-changed-packages';
import { pnpmRun } from './common/pnpm-helpers';

export async function main() {
  console.log('Running lint.'.cyan.bold);
  const all = await findChangedPackages([
    { parentDir: 'shared', diffInclude: [/\.eslintrc/, /.*\.ts$/] },
    { parentDir: 'apps', diffInclude: [/\.eslintrc/, /.*\.ts$/] },
  ]);
  await pnpmRun('lint', all);
}

if (require.main === module) {
  main();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
