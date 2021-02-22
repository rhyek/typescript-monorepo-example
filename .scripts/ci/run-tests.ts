#!/usr/bin/env ts-node-transpile-only
import { findChangedPackages } from './common/find-changed-packages';
import { pnpmExec, pnpmRun } from './common/pnpm-helpers';

/**
 * gather all shared packages that need to be built and build them first.
 * this is helpful in avoiding them each being built more than once simultaneously.
 * when running dependent packages' tests (which implicitly build dependencies)
 * in parallel as we do, if shared packages were to be built simultaneously
 * more than once (two apps depend on the same lib) there is a risk of
 * collision while writing output files.
 */
export async function main(testType: 'unit' | 'e2e') {
  if (!['unit', 'e2e'].includes(testType)) {
    throw new Error(`Invalid test type: ${testType}.`);
  }
  console.log(`Running ${testType} tests.`.cyan.bold);
  const appsConfig = {
    // any app package who's own files changed
    parentDir: 'apps',
    diffInclude: [/tsconfig/, /\/package\.json/, /\bjest\b/, /\.ts$/],
    diffExclude: testType === 'unit' ? /\.e2e-spec\.ts$/ : /\.spec\.ts$/,
  };
  const libs = await findChangedPackages([
    {
      parentDir: 'shared',
      diffInclude: [/tsconfig/, /\/package\.json/, /\.ts$/],
      diffExclude: /\.(e2e-)?spec\.ts$/,
    },
    {
      ...appsConfig,
      excludeSelf: true,
      includeDependencies: true,
    },
  ]);
  await pnpmExec(['pnpx', 'ttsc', '-b', 'tsconfig.build.json'], libs, true);
  const all = await findChangedPackages([
    {
      // any shared package who's own files changed
      parentDir: 'shared',
      diffInclude: [/tsconfig/, /\/package\.json/, /\bjest\b/, /\.ts$/],
      diffExclude: testType === 'unit' ? /\.e2e-spec\.ts$/ : /\.spec\.ts$/,
    },
    {
      // any shared package and its dependents who's own files changed except test files
      parentDir: 'shared',
      excludeSelf: true,
      includeDependents: true,
      diffInclude: [/tsconfig\.(build\.)?json/, /\/package\.json/, /\.ts$/],
      diffExclude: /\.(e2e-)?spec\.ts$/,
    },
    appsConfig,
  ]);
  await pnpmRun(`test:${testType}`, all);
}

if (require.main === module) {
  main(process.argv[2] as 'unit' | 'e2e');

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
