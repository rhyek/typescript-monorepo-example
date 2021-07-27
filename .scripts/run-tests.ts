#!/usr/bin/env ts-node-transpile-only
import {
  findChangedPackages,
  FindChangePackagesOptions,
} from './common/find-changed-packages';
import { findPackages } from './common/find-packages';
import { pnpmRun } from './common/pnpm-helpers';

const config = {
  unit: [
    {
      // any shared package who's own files changed
      parentDir: 'shared',
      diffInclude: [/tsconfig/, /\/package\.json/, /\bjest\b/, /src\/.+\.ts$/],
      diffExclude: [/test\/jest\b/],
    },
    {
      // any shared package and its dependents who's own files changed except test files
      parentDir: 'shared',
      excludeSelf: true,
      includeDependents: true,
      diffInclude: [
        /tsconfig\.(build\.)?json/,
        /\/package\.json/,
        /src\/.+\.ts$/,
      ],
      diffExclude: [/\.spec\.ts$/],
    },
    {
      // any app package who's own files changed
      parentDir: 'apps',
      diffInclude: [/tsconfig/, /\/package\.json/, /\bjest\b/, /src\/.+\.ts$/],
      diffExclude: [/test\/jest\b/],
    },
  ],
  e2e: [
    {
      // any shared package and its dependents who's own files changed except test files
      parentDir: 'shared',
      excludeSelf: true,
      includeDependents: true,
      diffInclude: [
        /tsconfig\.(build\.)?json/,
        /\/package\.json/,
        /src\/.+\.ts$/,
      ],
      diffExclude: [/\.spec\.ts$/],
    },
    {
      // any app package who's own files changed
      parentDir: 'apps',
      diffInclude: [
        /tsconfig\.((build|test-e2e)\.)?json/,
        /\/package\.json/,
        /\bjest\b/,
        /\/test\//,
        /src\/.+\.ts$/,
      ],
      diffExclude: [/\.spec\.ts$/],
    },
  ],
};

export async function getPackagesToTest(
  testType: 'unit' | 'e2e',
  options?: FindChangePackagesOptions,
) {
  const packages = await findChangedPackages(config[testType], options);
  return packages;
}

export async function getLibsToPrebuild(
  testType: 'unit' | 'e2e',
  options?: FindChangePackagesOptions,
) {
  const packagesToTest = await getPackagesToTest(testType, options);
  if (packagesToTest.length > 0) {
    const libsToPrebuild = (
      await findPackages(
        packagesToTest.map((packageInfo) => ({
          parentDir: packageInfo.dir,
          excludeSelf: true,
          includeDependencies: true,
        })),
      )
    ).map((p) => p.dir);
    return libsToPrebuild;
  }
  return [];
}

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
  const libs = await getLibsToPrebuild(testType);
  await pnpmRun('build', libs, true);
  const all = await getPackagesToTest(testType);
  await pnpmRun(
    `test:${testType}`,
    all.map((p) => p.dir),
  );
}

if (require.main === module) {
  main(process.argv[2] as 'unit' | 'e2e');

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
